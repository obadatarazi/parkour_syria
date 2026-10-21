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
use App\Models\EventTranslation;
use App\Models\GalleryImage;
use App\Models\GalleryImageTranslation;
use App\Models\Lesson;
use App\Models\LessonTranslation;
use App\Models\MultiTypeSetting;
use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\Slider;
use App\Models\SliderTranslation;
use App\Services\HomeCmsService;
use App\Services\SeoService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // The dashboard signs in through /api/admin/auth with personal access tokens. Passport's
        // OAuth server routes (/oauth/token, /oauth/authorize, the device flow) are not used.
        Passport::ignoreRoutes();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Short-lived access tokens; the dashboard refreshes proactively before expiry.
        Passport::personalAccessTokensExpireIn(now()->addHour());

        // Every password a dashboard account chooses: at least 8 characters, letters and numbers.
        Password::defaults(fn () => Password::min(8)->letters()->numbers());

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

        // The sitemap lists every published lesson, directory entry and blog post, and the website's
        // server-rendered HTML prints those plus the pages, events, areas and settings.
        $flushSitemap = static fn () => SeoService::flushCache();

        foreach ([
            Lesson::class,
            LessonTranslation::class,
            DirectoryEntry::class,
            DirectoryEntryTranslation::class,
            BlogPost::class,
            BlogPostTranslation::class,
            BlogCategory::class,
            BlogCategoryTranslation::class,
            Event::class,
            EventTranslation::class,
            Page::class,
            PageTranslation::class,
            Area::class,
            AreaTranslation::class,
            MultiTypeSetting::class,
        ] as $model) {
            $model::saved($flushSitemap);
            $model::deleted($flushSitemap);
        }
    }
}
