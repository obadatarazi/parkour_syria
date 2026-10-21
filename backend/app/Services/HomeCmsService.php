<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\DirectoryEntry;
use App\Models\Event;
use App\Models\GalleryImage;
use App\Models\Page;
use App\Models\Slider;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Composes the one payload GET /api/home answers with, so the website's first paint is a single
 * request. Stays out of the per-entity services: those own CRUD, home only needs capped published
 * slices of each.
 */
class HomeCmsService
{
    public const CACHE_TTL_SECONDS = 90;

    public const CACHE_SCHEMA_VERSION = 2;

    /**
     * @return array{
     *     sliders: Collection<int, Slider>,
     *     latest_blog_posts: Collection<int, BlogPost>,
     *     upcoming_events: Collection<int, Event>,
     *     featured_directory_entries: Collection<int, DirectoryEntry>,
     *     gallery_images: Collection<int, GalleryImage>,
     *     page: Page|null
     * }
     */
    public function getHomePayload(): array
    {
        $key = self::cacheKey(app()->getLocale());

        try {
            return Cache::remember($key, self::CACHE_TTL_SECONDS, fn () => $this->queryHomePayload());
        } catch (Throwable $exception) {
            report($exception);
            Log::warning('[home-cms] Cache unavailable; querying live', [
                'exception' => $exception->getMessage(),
            ]);

            return $this->queryHomePayload();
        }
    }

    public static function cacheKey(string $locale): string
    {
        return 'home:cms:' . $locale . ':v' . self::CACHE_SCHEMA_VERSION;
    }

    /**
     * Called whenever a model feeding one of the rails is saved or deleted. @see AppServiceProvider
     */
    public static function flushCache(): void
    {
        foreach (config('translatable.locales', ['ar', 'en']) as $locale) {
            Cache::forget(self::cacheKey($locale));
        }
    }

    private function queryHomePayload(): array
    {
        $limits = config('site.home');

        return [
            'sliders' => $this->safeRail('sliders', fn () => Slider::query()
                ->where('publish', true)
                ->with('translations')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->limit($limits['sliders'])
                ->get()),
            'latest_blog_posts' => $this->safeRail('latestBlogPosts', fn () => BlogPost::query()
                ->where('publish', true)
                ->with(['translations', 'category.translations'])
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->limit($limits['latest_blog_posts'])
                ->get()),
            // The cache lives 90 seconds, an event can only overstay its start by that much.
            'upcoming_events' => $this->safeRail('upcomingEvents', fn () => Event::query()
                ->where('publish', true)
                ->where('starts_at', '>=', now())
                ->with(['translations', 'area.translations'])
                ->orderBy('starts_at')
                ->limit($limits['upcoming_events'])
                ->get()),
            'featured_directory_entries' => $this->safeRail('featuredDirectoryEntries', fn () => DirectoryEntry::query()
                ->where('publish', true)
                ->where('verified', true)
                ->with(['translations', 'area.translations'])
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->limit($limits['featured_directory_entries'])
                ->get()),
            'gallery_images' => $this->safeRail('galleryImages', fn () => GalleryImage::query()
                ->where('publish', true)
                ->with('translations')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->limit($limits['gallery_images'])
                ->get()),
            'page' => $this->safeRail('page', fn () => Page::query()
                ->where('key', 'home')
                ->where('publish', true)
                ->with('translations')
                ->first()),
        ];
    }

    /**
     * One rail failing leaves it empty instead of taking the whole home page down.
     *
     * @template T
     * @param callable(): T $query
     * @return T|Collection|null
     */
    private function safeRail(string $rail, callable $query)
    {
        try {
            return $query();
        } catch (Throwable $exception) {
            report($exception);
            Log::error("[home-cms] Failed to load {$rail}", [
                'exception' => $exception->getMessage(),
            ]);

            return $rail === 'page' ? null : collect();
        }
    }
}
