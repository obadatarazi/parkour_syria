<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Lang;
use ValueError;

trait EnumTrait
{
    public static function getOptions($translator): array
    {
        return array_map(function ($item) use ($translator) {
            return [
                'label' => $item->trans($translator),
                'value' => $item->value,
            ];
        }, self::cases());
    }

    public static function getByName($name): self
    {
        foreach (self::cases() as $case) {
            if ($case->name === $name) {
                return $case;
            }
        }

        throw new ValueError(
            '"'.$name.'" is not a valid case name for enum '.static::class
        );
    }

    public function trans($translator): string
    {
        return Lang::get('enum.'.$this->value, [], $translator);
    }

    public static function getValues(): array
    {
        return array_column(self::cases(), 'value');
    }
}
