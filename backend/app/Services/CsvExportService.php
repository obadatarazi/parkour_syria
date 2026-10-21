<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Turns any model listing into a csv the admin downloads.
 *
 * The columns are read off the database rather than off a hand written list, so an export is never
 * behind the schema: every column of the model's own table is there, every column of its translation
 * table is there, written in the language the request asked for, and every relation it holds is
 * there too. The only thing left out is what the model itself hides — a password hash, a remember
 * token — which is not information an export is asking for.
 *
 * A relation is written by its name, never by its key: the `brand_id` column of a product is read as
 * a `brand` column holding the brand's title, and its categories are a `categories` column holding
 * their titles. A number nobody can look up is not information to whoever opens the file. The name
 * is taken in the locale the request asked for, so an export follows `x-locale` like the rest of the
 * api does.
 *
 * The rows are streamed and read back in batches, so exporting a large catalogue costs a constant
 * amount of memory instead of loading the table into it.
 */
class CsvExportService
{
    /**
     * How many rows are read from the database at a time.
     */
    protected const CHUNK = 500;

    /**
     * Columns whose name says they hold a secret, dropped even when the model does not hide them.
     *
     * @var list<string>
     */
    protected const NEVER_EXPORTED = ['password', 'remember_token'];

    /**
     * What separates the names inside a single many-to-many cell.
     */
    protected const LIST_SEPARATOR = ' | ';

    /**
     * The attributes a record is called by, most telling first. The first one the related model
     * actually carries becomes the name written in the file.
     *
     * @var list<string>
     */
    protected const LABEL_ATTRIBUTES = [
        'title',
        'name',
        // A record with a reference of its own is called by it, not by the name of the customer
        // that happens to be copied onto it — an order reads as ORD-…, never as its buyer.
        'order_ref_number',
        'full_name',
        'label',
        'code',
        'key',
        'slug',
        'email',
        'phone_number',
        'type',
        'status',
    ];

    /**
     * @param  list<string>|null  $only  Column keys to keep, in the order they were asked for.
     *                                   Null or an empty list keeps every column.
     */
    public function download(Builder $query, string $name, ?array $only = null): StreamedResponse
    {
        $model = $query->getModel();
        $columns = $this->columns($model, $only);
        $fileName = $name.'-'.Carbon::now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');

            // Excel reads a csv as the local codepage unless the file opens with a byte order mark,
            // and without it every Arabic title in the export comes out as mojibake.
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, array_keys($columns));

            // Paged by primary key rather than by offset: a plain offset walk over a table someone
            // else is writing to skips and repeats rows between pages.
            $query->lazyById(self::CHUNK)->each(function (Model $row) use ($handle, $columns) {
                fputcsv($handle, array_map(static fn (callable $value) => $value($row), $columns));
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * The relations a row has to carry for its columns to be filled in.
     *
     * @return list<string>
     */
    public function relations(Model $model): array
    {
        $relations = $this->isTranslatable($model) ? ['translations'] : [];

        foreach ($this->belongsToRelations($model) as [$name, $relation]) {
            $relations = array_merge($relations, $this->relationWithLabelSource($name, $relation->getRelated()));
        }

        foreach ($this->manyToManyRelations($model) as [$name, $relation]) {
            $relations = array_merge($relations, $this->relationWithLabelSource($name, $relation->getRelated()));
        }

        return $relations;
    }

    /**
     * A relation, plus the translations its name lives in when the related model is translatable —
     * without them the label of every row costs its own query.
     *
     * @return list<string>
     */
    protected function relationWithLabelSource(string $name, Model $related): array
    {
        return $this->isTranslatable($related) ? [$name, $name.'.translations'] : [$name];
    }

    /**
     * The query values an admin can send as `attributes` — the csv headers themselves — with a
     * label in the locale the request asked for.
     *
     * @return list<array{label: string, value: string}>
     */
    public function columnOptions(Model $model): array
    {
        $options = [];

        foreach (array_keys($this->columns($model)) as $key) {
            $options[] = [
                'label' => $this->columnLabel($key),
                'value' => $key,
            ];
        }

        return $options;
    }

    /**
     * Turns the `attributes` query value into the list of csv headers to keep. A missing, empty,
     * or blank value means every column; a string is split on commas; an array is kept as sent.
     *
     * @return list<string>|null
     */
    public function requestedColumns(mixed $raw): ?array
    {
        if ($raw === null || $raw === '' || $raw === []) {
            return null;
        }

        $values = is_array($raw) ? $raw : explode(',', (string) $raw);
        $values = array_values(array_unique(array_filter(
            array_map(static fn ($value) => trim((string) $value), $values),
            static fn (string $value) => $value !== ''
        )));

        return $values === [] ? null : $values;
    }

    /**
     * The header of the file, mapped to how each cell of it is read off a row.
     *
     * @param  list<string>|null  $only
     * @return array<string, callable(Model): string>
     */
    protected function columns(Model $model, ?array $only = null): array
    {
        $own = $this->ownColumns($model);

        $all = array_merge(
            $own,
            $this->translationColumns($model, array_keys($own)),
            $this->relationColumns($model)
        );

        if ($only === null || $only === []) {
            return $all;
        }

        Validator::validate(
            ['attributes' => $only],
            [
                'attributes' => 'required|array|min:1',
                'attributes.*' => 'required|string|in:'.implode(',', array_keys($all)),
            ]
        );

        $filtered = [];

        foreach ($only as $key) {
            $filtered[$key] = $all[$key];
        }

        return $filtered;
    }

    protected function columnLabel(string $key): string
    {
        $translationKey = "export.columns.$key";
        $translated = __($translationKey);

        return $translated === $translationKey ? Str::headline($key) : $translated;
    }

    /**
     * @return array<string, callable(Model): string>
     */
    protected function ownColumns(Model $model): array
    {
        $hidden = array_merge($model->getHidden(), self::NEVER_EXPORTED);
        $belongsTo = $this->belongsToRelations($model);
        $columns = [];

        foreach (Schema::getColumnListing($model->getTable()) as $column) {
            if (in_array($column, $hidden, true)) {
                continue;
            }

            // The key is replaced by what it points at, in the place the key held, so the column
            // order of the file still follows the table.
            if (isset($belongsTo[$column])) {
                [$name] = $belongsTo[$column];

                $columns[Str::snake($name)] = fn (Model $row) => $row->relationLoaded($name)
                    ? $this->label($row->getRelation($name))
                    : '';

                continue;
            }

            $columns[$column] = fn (Model $row) => $this->cell($row->getAttributes()[$column] ?? null);
        }

        return $columns;
    }

    /**
     * Every column of the translation table, once, written in the language the request asked for.
     *
     * The file is read by a person, not merged back into the database, and a person reading an
     * export in Arabic has no use for a second Arabic column called `title_en`. The header is the
     * plain name of the field — `title`, `description` — and what fills it follows `x-locale`.
     *
     * @return array<string, callable(Model): string>
     */
    protected function translationColumns(Model $model, array $taken = []): array
    {
        if (! $this->isTranslatable($model)) {
            return [];
        }

        $translationClass = $model->getTranslationModelName();
        $translation = new $translationClass;
        $skipped = [
            $translation->getKeyName(),
            $model->getLocaleKey() ?: 'locale',
            $model->getTranslationRelationKey() ?: $model->getForeignKey(),
            'created_at',
            'updated_at',
        ];

        $columns = [];

        foreach (Schema::getColumnListing($translation->getTable()) as $column) {
            if (in_array($column, $skipped, true)) {
                continue;
            }

            // A model that carries a column of its own under the same name — an untranslated
            // `slug` beside a translated one — keeps both, told apart by the language of the one
            // that is translated.
            $header = in_array($column, $taken, true) ? $column.'_'.app()->getLocale() : $column;

            $columns[$header] = fn (Model $row) => $this->cell($this->translated($row, $column));
        }

        return $columns;
    }

    /**
     * One translated field of a row, in the asked-for locale, falling back to the configured
     * fallback and then to any locale that has it — a value in the wrong language still says more
     * than an empty cell.
     */
    protected function translated(Model $row, string $attribute)
    {
        foreach ([app()->getLocale(), config('translatable.fallback_locale')] as $locale) {
            $value = $locale ? ($row->translate($locale)?->getAttributes()[$attribute] ?? null) : null;

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        foreach ($row->translations as $translation) {
            $value = $translation->getAttributes()[$attribute] ?? null;

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * One column per many-to-many, holding the names on the other side, separated by a pipe so a
     * name that carries a comma still reads as one entry.
     *
     * @return array<string, callable(Model): string>
     */
    protected function relationColumns(Model $model): array
    {
        $columns = [];

        foreach ($this->manyToManyRelations($model) as $key => [$name]) {
            $columns[$key] = fn (Model $row) => $row->relationLoaded($name)
                ? $row->getRelation($name)
                    ->map(fn (Model $related) => $this->label($related))
                    ->filter()
                    ->implode(self::LIST_SEPARATOR)
                : '';
        }

        return $columns;
    }

    /**
     * The belongs-to relations a model declares, keyed by the column that holds their key, so an
     * export can answer a `brand_id` with the brand.
     *
     * @return array<string, array{0: string, 1: BelongsTo}>
     */
    protected function belongsToRelations(Model $model): array
    {
        $relations = [];

        foreach ($this->declaredRelations($model, BelongsTo::class) as $name => $relation) {
            $foreignKey = $relation->getForeignKeyName();

            // Two names for the same key — `user()` and `customer()` on one `user_id` — are one
            // column, and the first one the model declares names it.
            if (isset($relations[$foreignKey])) {
                continue;
            }

            $relations[$foreignKey] = [$name, $relation];
        }

        return $relations;
    }

    /**
     * The name a related record is known by, read in the locale the request asked for. A record
     * with nothing to be called by falls back to its key, so a cell is never blank when a relation
     * is actually there.
     */
    protected function label(?Model $related): string
    {
        if (! $related) {
            return '';
        }

        foreach (self::LABEL_ATTRIBUTES as $attribute) {
            $value = $this->readLabel($related, $attribute);

            if ($value !== null && $value !== '') {
                return $this->cell($value);
            }
        }

        return (string) $related->getKey();
    }

    /**
     * One candidate name off a related record: out of its translations when it is translatable and
     * the attribute lives there, out of its own columns otherwise. A translation missing in the
     * asked-for locale falls back to any locale that has one — a name in the wrong language still
     * says more than an empty cell.
     */
    protected function readLabel(Model $related, string $attribute)
    {
        $translated = is_array($related->translatedAttributes ?? null)
            && in_array($attribute, $related->translatedAttributes, true);

        return $translated
            ? $this->translated($related, $attribute)
            : ($related->getAttributes()[$attribute] ?? null);
    }

    /**
     * The many-to-many relations a model declares, read off the return types of its own methods, so
     * a relation added later lands in the export without anyone remembering to list it here.
     *
     * @return array<string, BelongsToMany>
     */
    protected function manyToManyRelations(Model $model): array
    {
        $relations = [];

        foreach ($this->declaredRelations($model, BelongsToMany::class) as $name => $relation) {
            // A model that spells the same relation twice — once snake_cased, once camelCased —
            // must not be exported twice, the two are the same column.
            $key = Str::snake($name);

            if (isset($relations[$key])) {
                continue;
            }

            $relations[$key] = [$name, $relation];
        }

        return $relations;
    }

    /**
     * The relations of a given kind a model declares, found by the return types of its own methods.
     * A relation the model does not type is invisible here, which is the price of not keeping a
     * hand written list of them per model.
     *
     * @param  class-string  $kind
     * @return array<string, mixed> Relation name to the relation instance.
     */
    protected function declaredRelations(Model $model, string $kind): array
    {
        $relations = [];

        foreach ((new ReflectionClass($model))->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $type = $method->getReturnType();

            if (
                $method->getNumberOfParameters() > 0
                || $method->isStatic()
                || ! $type instanceof ReflectionNamedType
                || $type->getName() !== $kind
            ) {
                continue;
            }

            $relations[$method->getName()] = $model->{$method->getName()}();
        }

        return $relations;
    }

    protected function isTranslatable(Model $model): bool
    {
        return method_exists($model, 'getTranslationModelName') && method_exists($model, 'translate');
    }

    /**
     * A cell is text. Anything the driver hands back that is not — a json column, a boolean — is
     * written the way it reads rather than as an empty cell.
     */
    protected function cell($value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return (string) $value;
    }
}
