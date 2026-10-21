<?php

namespace App\Services;

use App\Http\QueryFilter\QueryFilter;
use App\Models\MultiTypeSetting;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class MultiTypeSettingService extends BaseService
{
    /**
     * One cache entry holds the whole table. There are only a few dozen rows, they change when an
     * admin saves a value, and both the dashboard list and the per-key lookups hit them constantly.
     */
    public const CACHE_KEY = 'multi_type_settings.all';

    public const CACHE_TTL_SECONDS = 3600;

    public function __construct()
    {
        $this->model = MultiTypeSetting::class;
        parent::__construct();
    }

    /**
     * Every setting, served from cache when the store is up. Falls back to a live query when cache
     * throws so a Redis/database-cache outage cannot take the admin Settings page down.
     *
     * @return Collection<int, MultiTypeSetting>
     */
    public function allCached(): Collection
    {
        try {
            /** @var Collection<int, MultiTypeSetting> $cached */
            $cached = Cache::remember(
                self::CACHE_KEY,
                self::CACHE_TTL_SECONDS,
                fn () => $this->queryAll()
            );

            return $cached;
        } catch (Throwable $exception) {
            report($exception);
            Log::warning('[multi-type-settings] Cache unavailable; querying live', [
                'exception' => $exception->getMessage(),
            ]);

            return $this->queryAll();
        }
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public static function cacheKey(): string
    {
        return self::CACHE_KEY;
    }

    /**
     * A key that is not in the table is a missing setting, not a broken server, so it answers with
     * a 404. Returning `first()` under a non nullable return type turned it into a TypeError, and
     * the 500 that came out of it carried no CORS header, which the browser reported as a CORS
     * error instead of the missing row it actually was.
     *
     * @throws ModelNotFoundException
     */
    public function findBySettingKey($settingKey): MultiTypeSetting
    {
        $setting = $this->allCached()->firstWhere('setting_key', $settingKey);

        if (!$setting instanceof MultiTypeSetting) {
            throw (new ModelNotFoundException())->setModel(MultiTypeSetting::class, [$settingKey]);
        }

        return $setting;
    }

    /**
     * Paginate the cached table in memory. The table is tiny, the admin list asks for every row
     * most of the time, and a filtered FULLTEXT pass over twenty keys is cheaper than another
     * round trip once the cache is warm.
     */
    public function findAllPaginated(QueryFilter $modelFilter)
    {
        $filters = $modelFilter->getFiltersFields();
        $page = $this->resolvePage($filters);
        $limit = $this->resolveLimit($filters);

        $items = $this->allCached();

        if (!empty($filters['type'])) {
            $type = (string) $filters['type'];
            $items = $items->where('type', $type)->values();
        }

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $needle = mb_strtolower(trim($filters['search']));
            $items = $items
                ->filter(function (MultiTypeSetting $setting) use ($needle) {
                    return str_contains(mb_strtolower((string) $setting->setting_key), $needle)
                        || str_contains(mb_strtolower((string) $setting->description), $needle)
                        || str_contains(mb_strtolower((string) $setting->value), $needle);
                })
                ->values();
        }

        $sort = $modelFilter->getSortField();
        if ($sort === '' || $sort === null) {
            $sort = 'id';
        }

        $allowed = ['id', 'setting_key', 'type', 'created_at'];
        if (!in_array($sort, $allowed, true)) {
            $sort = 'id';
        }

        $direction = strtolower((string) $modelFilter->getSortDirection()) === 'desc' ? 'desc' : 'asc';
        $items = $direction === 'desc'
            ? $items->sortByDesc($sort)->values()
            : $items->sortBy($sort)->values();

        $total = $items->count();
        $pageItems = $items->forPage($page, $limit)->values();

        $request = request();

        return new LengthAwarePaginator($pageItems, $total, $limit, $page, [
            'path' => $request ? $request->url() : '/',
            'query' => $request ? $request->query() : [],
        ]);
    }

    /**
     * The settings the website may read, keyed by setting key. Only the keys listed in
     * `config('site.public_settings')` ever leave the server, a setting is internal until it is
     * added there. A listed key that has no row yet is answered as null.
     *
     * @return array<string, string|null>
     */
    public function publicSettings(): array
    {
        $settings = $this->allCached()->keyBy('setting_key');
        $public = [];

        foreach (config('site.public_settings', []) as $key) {
            $public[$key] = $settings->get($key)?->value;
        }

        return $public;
    }

    /**
     * @return Collection<int, MultiTypeSetting>
     */
    protected function queryAll(): Collection
    {
        return MultiTypeSetting::query()->orderBy('id')->get();
    }
}
