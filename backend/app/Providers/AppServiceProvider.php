<?php

namespace App\Providers;

use App\Models\Area;
use App\Models\AreaTranslation;
use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogPost;
use App\Models\BlogPostTranslation;
use App\Models\DirectoryEntry;
use App\Models\DirectoryEntryTranslation;
use App\Models\Event;
use App\Models\GalleryImage;
use App\Models\GalleryImageTranslation;
use App\Models\EventTranslation;
use App\Models\Lesson;
use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\Slider;
use App\Models\SliderTranslation;
use App\Services\HomeCmsService;
use App\Services\SeoService;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Short-lived access tokens; the dashboard refreshes proactively before expiry.
        Passport::personalAccessTokensExpireIn(now()->addHour());

        // GET /api/home is cached per locale. Anything one of its rails draws drops that cache when
        // it is written, so an admin sees their edit on the next home load. Areas and blog
        // categories are in the list because the cards print their names.
        $flushHomeCms = static fn () => HomeCmsService::flushCache();

        foreach ([
            Slider::class,
            SliderTranslation::class,
            BlogPost::class,
            BlogPostTranslation::class,
            BlogCategory::class,
            BlogCategoryTranslation::class,
            Event::class,
            EventTranslation::class,
            DirectoryEntry::class,
            DirectoryEntryTranslation::class,
            Area::class,
            AreaTranslation::class,
            Page::class,
            PageTranslation::class,
            GalleryImage::class,
            GalleryImageTranslation::class,
        ] as $model) {
            $model::saved($flushHomeCms);
            $model::deleted($flushHomeCms);
        }

        // The sitemap lists every published lesson, directory entry and blog post.
        $flushSitemap = static fn () => SeoService::flushCache();

        foreach ([Lesson::class, DirectoryEntry::class, BlogPost::class] as $model) {
            $model::saved($flushSitemap);
            $model::deleted($flushSitemap);
        }
    }
}
