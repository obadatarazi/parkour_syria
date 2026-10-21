<?php

namespace App\Models\Concerns;

/**
 * A lightweight label/value list for dashboard and website dropdowns, labelled in the request
 * locale. The using model names the translated attribute that labels it in `$optionLabel`.
 */
trait HasTranslatedOptions
{
    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function getOptions(string $locale): array
    {
        $model = new static;
        $label = $model->optionLabel ?? 'title';

        return static::query()
            ->with('translations')
            ->when(isset($model->defaultSort), function ($query) use ($model) {
                foreach ($model->defaultSort as $column => $direction) {
                    $query->orderBy($column, $direction);
                }
            })
            ->get()
            ->map(fn ($item) => [
                'label' => (string) ($item->translate($locale)?->{$label} ?? $item->{$label}),
                'value' => (string) $item->getKey(),
            ])
            ->values()
            ->all();
    }
}
