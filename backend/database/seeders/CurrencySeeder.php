<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            [
                'symbol' => 'ل.س',
                'code' => 'SYP',
                'publish' => true,
                'is_default' => true,
                'translations' => [
                    'en' => [
                        'title' => 'Syrian Pound',
                    ],
                    'ar' => [
                        'title' => 'ليرة سورية',
                    ],
                ],
            ],
        ];

        foreach ($currencies as $currency) {
            $translations = $currency['translations'];
            unset($currency['translations']);

            if (Currency::query()->where('code', $currency['code'])->exists()) {
                continue;
            }

            $currencyModel = Currency::query()->create($currency);

            foreach ($translations as $locale => $translation) {
                $currencyModel->translations()->create([
                    'locale' => $locale,
                    ...$translation,
                ]);
            }
        }
    }
}
