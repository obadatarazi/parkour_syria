<?php

namespace Tests\Feature;

use App\Http\QueryFilter\MultiTypeSettingFilter;
use App\Models\MultiTypeSetting;
use App\Services\MultiTypeSettingService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Self-contained sqlite tests so the settings cache contract is verified without MySQL.
 */
class MultiTypeSettingCacheTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
            'cache.default' => 'array',
        ]);

        DB::purge('sqlite');
        DB::reconnect('sqlite');

        Schema::dropIfExists('multi_type_settings');
        Schema::create('multi_type_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key')->unique();
            $table->text('value')->nullable();
            $table->string('type');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Cache::flush();
        MultiTypeSettingService::flushCache();
    }

    public function test_all_cached_populates_and_reuses_cache(): void
    {
        MultiTypeSetting::query()->create([
            'setting_key' => 'CACHE_TEST_LINK',
            'value' => 'https://example.com',
            'type' => 'LINK',
            'description' => 'cache test',
        ]);
        MultiTypeSettingService::flushCache();

        $service = app(MultiTypeSettingService::class);
        $first = $service->allCached();

        $this->assertTrue(Cache::has(MultiTypeSettingService::cacheKey()));
        $this->assertNotNull($first->firstWhere('setting_key', 'CACHE_TEST_LINK'));

        // Delete via query builder so model events do not flush the cache — proves reads are cached.
        DB::table('multi_type_settings')->delete();

        $second = $service->allCached();
        $this->assertNotNull($second->firstWhere('setting_key', 'CACHE_TEST_LINK'));
    }

    public function test_saving_a_setting_flushes_the_cache(): void
    {
        $setting = MultiTypeSetting::query()->create([
            'setting_key' => 'CACHE_TEST_FLUSH',
            'value' => 'before',
            'type' => 'TEXT',
            'description' => 'flush test',
        ]);

        app(MultiTypeSettingService::class)->allCached();
        $this->assertTrue(Cache::has(MultiTypeSettingService::cacheKey()));

        $setting->value = 'after';
        $setting->save();

        $this->assertFalse(
            Cache::has(MultiTypeSettingService::cacheKey()),
            'Saving a setting must drop the shared multi-type-settings cache'
        );

        $fresh = app(MultiTypeSettingService::class)->findBySettingKey('CACHE_TEST_FLUSH');
        $this->assertSame('after', $fresh->value);
    }

    public function test_find_all_paginated_serves_from_cache_and_sorts(): void
    {
        MultiTypeSetting::query()->create([
            'setting_key' => 'ZZ_LAST',
            'value' => '1',
            'type' => 'NUMBER',
            'description' => 'page test',
        ]);
        MultiTypeSetting::query()->create([
            'setting_key' => 'AA_FIRST',
            'value' => '2',
            'type' => 'NUMBER',
            'description' => 'page test',
        ]);
        MultiTypeSettingService::flushCache();

        $request = Request::create(
            '/api/admin/multi-type-settings',
            'GET',
            ['sort' => 'setting_key', 'direction' => 'asc', 'limit' => 50]
        );
        $this->app->instance('request', $request);

        $page = app(MultiTypeSettingService::class)->findAllPaginated(
            new MultiTypeSettingFilter($request)
        );

        $this->assertTrue(Cache::has(MultiTypeSettingService::cacheKey()));
        $this->assertSame(2, $page->total());
        $this->assertSame(
            ['AA_FIRST', 'ZZ_LAST'],
            collect($page->items())->pluck('setting_key')->all()
        );
    }
}
