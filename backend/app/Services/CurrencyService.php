<?php

namespace App\Services;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CurrencyService extends BaseService
{
    public function __construct()
    {
        $this->model = Currency::class;
        parent::__construct();
    }

    public function create($data)
    {
        return DB::transaction(function () use ($data) {
            $isFirstCurrency = ! Currency::query()->exists();

            if ($isFirstCurrency) {
                $data['is_default'] = true;
            }

            if (! empty($data['is_default'])) {
                $this->unsetOtherDefaults();
            }

            return parent::create($data);
        });
    }

    public function update($data, Model $object)
    {
        return DB::transaction(function () use ($data, $object) {
            if (! empty($data['is_default'])) {
                $this->unsetOtherDefaults($object->id);
            }

            return parent::update($data, $object);
        });
    }

    public function delete(Model $object): void
    {
        if ($object->is_default) {
            abort(422, __('exceptions.can_not_delete_default_currency'));
        }

        parent::delete($object);
    }

    private function unsetOtherDefaults(?int $exceptId = null): void
    {
        Currency::query()
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->update(['is_default' => false]);
    }
}
