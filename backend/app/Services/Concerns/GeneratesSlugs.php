<?php

namespace App\Services\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * The url slug of a record that carries one `slug` column for every locale (lessons, directory
 * entries, events, blog posts, ...).
 *
 * An admin may type the slug. When they don't, it is built from the English title if there is one
 * (a latin url reads better in a shared link) and from the Arabic one otherwise. Arabic letters are
 * kept as they are, only spaces and punctuation become dashes.
 */
trait GeneratesSlugs
{
    public function slugify(?string $text): string
    {
        $text = mb_strtolower(trim((string) $text));
        $text = preg_replace('/[^\p{L}\p{N}]+/u', '-', $text) ?? '';

        return trim($text, '-');
    }

    /**
     * @param  array<string, mixed>  $data  validated input, translations already split per locale
     * @param  string  $titleAttribute  the translated attribute the slug falls back to
     */
    protected function resolveSlug(array $data, ?Model $object = null, string $titleAttribute = 'title'): ?string
    {
        if (! empty($data['slug'])) {
            return $this->uniqueSlug($this->slugify($data['slug']), $object);
        }

        // An update without a slug keeps the one the record already has, a url must not move
        // because a title was reworded.
        if ($object && $object->getAttribute('slug')) {
            return null;
        }

        $source = $data['en'][$titleAttribute] ?? $data['ar'][$titleAttribute] ?? null;
        $base = $this->slugify($source);

        if ($base === '') {
            $base = Str::lower(Str::random(8));
        }

        return $this->uniqueSlug($base, $object);
    }

    protected function uniqueSlug(string $base, ?Model $object = null): string
    {
        $slug = Str::limit($base, 140, '');
        $suffix = 2;

        while ($this->model::query()
            ->where('slug', $slug)
            ->when($object, fn ($query) => $query->whereKeyNot($object->getKey()))
            ->exists()) {
            $slug = Str::limit($base, 140, '').'-'.$suffix++;
        }

        return $slug;
    }

    /**
     * Fills `slug` into the data about to be saved, when there is one to fill.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function withSlug(array $data, ?Model $object = null, string $titleAttribute = 'title'): array
    {
        $slug = $this->resolveSlug($data, $object, $titleAttribute);

        if ($slug === null) {
            unset($data['slug']);
        } else {
            $data['slug'] = $slug;
        }

        return $data;
    }
}
