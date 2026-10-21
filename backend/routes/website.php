<?php

use App\Http\Controllers\Website\WebsiteController;
use Illuminate\Support\Facades\Route;

/*
 * The public website, served with its SEO data in the HTML (WebsitePageService). Registered last and
 * without the web group: visitors and crawlers need no session or cookies here.
 *
 * Files that exist under public/ (the built assets, /storage) are served by the web server before
 * Laravel is reached, so only page urls land here.
 */
Route::get('/sitemap.xml', [WebsiteController::class, 'sitemap']);
Route::get('/robots.txt', [WebsiteController::class, 'robots']);
Route::get('/llms.txt', [WebsiteController::class, 'llms']);

Route::prefix(trim((string) config('site.website.base_path'), '/'))->group(function () {
    Route::get('/{path?}', [WebsiteController::class, 'show'])
        ->where('path', '^(?!(api|admin|storage|oauth|docs|up)(/|$)).*$')
        ->name('website');
});
