<?php

use App\Support\Features;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AreaController,
    BlogCategoryController,
    BlogPostController,
    BrandController,
    CategoryController,
    DirectoryEntryController,
    EventController,
    GalleryImageController,
    HomeController,
    LessonController,
    OptionController,
    PageController,
    ProductController,
    SeoController,
    SiteSettingController,
    SliderController,
    SuggestionController,
    TagController
};

use App\Http\Controllers\Api\Admin\{
    AdminAreaController,
    AdminAuthController,
    AdminBlogCategoryController,
    AdminBlogPostController,
    AdminBrandController,
    AdminCategoryController,
    AdminCouponController,
    AdminCurrencyController,
    AdminDirectoryEntryController,
    AdminEventController,
    AdminGalleryImageController,
    AdminLessonController,
    AdminMultiTypeSettingController,
    AdminOrderController,
    AdminPageController,
    AdminPermissionController,
    AdminProductController,
    AdminRoleController,
    AdminRolesController,
    AdminSliderController,
    AdminSuggestionController,
    AdminTagController,
    AdminUserController
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::prefix('/admin/auth')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:10,1');
    Route::get('/logout', [AdminAuthController::class, 'logout'])->middleware(['auth:api']);
    Route::post('/refresh-token', [AdminAuthController::class, 'refreshToken'])->middleware('throttle:30,1');
    Route::get('/me/profile', [AdminAuthController::class, 'me'])->middleware(['auth:api', 'active']);
    // Left open to a deactivated account on purpose: it is how the dashboard tells them why.
    Route::get('/account/status', [AdminAuthController::class, 'getAccountStatus'])->middleware(['auth:api']);
});

Route::prefix('/admin')->middleware(['auth:api', 'active'])->group(function () {
    Route::get('/me/profile', [AdminAuthController::class, 'me']);
    Route::put('/me/profile/update', [AdminAuthController::class, 'updateProfileAdmin']);
    Route::get('/me/roles', [AdminAuthController::class, 'getMyRoles']);
    Route::post('/me/password/change', [AdminAuthController::class, 'changePassword']);

    // Csv exports and bulk deletes. Declared before the resources so `/export` and `/bulk-delete`
    // are never read as the id of a record. See ApiController::baseExport() / baseBulkDestroy().
    $exportable = [
        'users' => AdminUserController::class,
        'roles' => AdminRoleController::class,
        'multi-type-settings' => AdminMultiTypeSettingController::class,
        'areas' => AdminAreaController::class,
        'pages' => AdminPageController::class,
        'sliders' => AdminSliderController::class,
        'lessons' => AdminLessonController::class,
        'directory-entries' => AdminDirectoryEntryController::class,
        'events' => AdminEventController::class,
        'suggestions' => AdminSuggestionController::class,
        'blog-categories' => AdminBlogCategoryController::class,
        'blog-posts' => AdminBlogPostController::class,
        'gallery-images' => AdminGalleryImageController::class,
    ];

    foreach ($exportable as $path => $controller) {
        Route::get("/{$path}/export", [$controller, 'export']);
    }

    foreach ($exportable as $path => $controller) {
        // Pages are fixed, they are edited but never deleted.
        if ($path === 'pages' || $path === 'multi-type-settings') {
            continue;
        }
        Route::post("/{$path}/bulk-delete", [$controller, 'bulkDestroy']);
    }

    // Accounts and access (SuperAdmin).
    Route::apiResource('/users', AdminUserController::class);
    Route::apiResource('/roles', AdminRoleController::class);
    Route::get('/permissions', [AdminPermissionController::class, 'index']);
    Route::get('/role/list', [AdminRolesController::class, 'findAll']);
    Route::get('/role/by-section', [AdminRolesController::class, 'getBySection']);

    // Settings (SuperAdmin).
    Route::apiResource('/multi-type-settings', AdminMultiTypeSettingController::class);

    // Content (SuperAdmin + Supervisor).
    Route::apiResource('/areas', AdminAreaController::class)->names('admin.areas');
    Route::apiResource('/pages', AdminPageController::class)->only(['index', 'show', 'update'])->names('admin.pages');
    Route::apiResource('/sliders', AdminSliderController::class)->names('admin.sliders');
    Route::apiResource('/lessons', AdminLessonController::class)->names('admin.lessons');
    Route::apiResource('/directory-entries', AdminDirectoryEntryController::class)
        ->parameters(['directory-entries' => 'directory_entry'])
        ->names('admin.directory-entries');
    Route::apiResource('/events', AdminEventController::class)->names('admin.events');
    Route::post('/suggestions/{suggestion}/accept', [AdminSuggestionController::class, 'accept']);
    Route::post('/suggestions/{suggestion}/reject', [AdminSuggestionController::class, 'reject']);
    Route::apiResource('/suggestions', AdminSuggestionController::class)->except(['store'])->names('admin.suggestions');
    Route::apiResource('/blog-categories', AdminBlogCategoryController::class)
        ->parameters(['blog-categories' => 'blog_category'])
        ->names('admin.blog-categories');
    Route::apiResource('/blog-posts', AdminBlogPostController::class)
        ->parameters(['blog-posts' => 'blog_post'])
        ->names('admin.blog-posts');
    Route::apiResource('/gallery-images', AdminGalleryImageController::class)
        ->parameters(['gallery-images' => 'gallery_image'])
        ->names('admin.gallery-images');

    // Dormant shop. Not registered at all until FEATURE_ECOMMERCE=true.
    if (Features::ecommerce()) {
        foreach ([
            'brands' => AdminBrandController::class,
            'categories' => AdminCategoryController::class,
            'tags' => AdminTagController::class,
            'currencies' => AdminCurrencyController::class,
            'products' => AdminProductController::class,
        ] as $path => $controller) {
            Route::get("/{$path}/export", [$controller, 'export']);
            Route::post("/{$path}/bulk-delete", [$controller, 'bulkDestroy']);
        }

        Route::post('/coupons/bulk-delete', [AdminCouponController::class, 'bulkDestroy']);

        Route::apiResource('/brands', AdminBrandController::class)->names('admin.brands');
        Route::apiResource('/categories', AdminCategoryController::class)->names('admin.categories');
        Route::apiResource('/tags', AdminTagController::class)->names('admin.tags');
        Route::apiResource('/currencies', AdminCurrencyController::class)->names('admin.currencies');
        Route::apiResource('/products', AdminProductController::class)->names('admin.products');
        Route::apiResource('/coupons', AdminCouponController::class)->names('admin.coupons');
        Route::apiResource('/orders', AdminOrderController::class)->only(['index', 'show', 'update'])->names('admin.orders');
    }
});

/*
|--------------------------------------------------------------------------
| Website (published content only)
|--------------------------------------------------------------------------
*/

Route::get('/home', [HomeController::class, 'home']);
Route::get('/site-settings', [SiteSettingController::class, 'index']);

Route::get('/areas', [AreaController::class, 'index']);
Route::get('/areas/{slug}', [AreaController::class, 'show']);
Route::get('/pages/{key}', [PageController::class, 'show']);
Route::get('/sliders', [SliderController::class, 'index']);
Route::get('/sliders/{id}', [SliderController::class, 'show'])->whereNumber('id');
Route::get('/lessons', [LessonController::class, 'index']);
Route::get('/lessons/{slug}', [LessonController::class, 'show']);
Route::get('/directory-entries', [DirectoryEntryController::class, 'index']);
Route::get('/directory-entries/{slug}', [DirectoryEntryController::class, 'show']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);
Route::get('/blog-categories', [BlogCategoryController::class, 'index']);
Route::get('/blog-categories/{slug}', [BlogCategoryController::class, 'show']);
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}/related', [BlogPostController::class, 'related']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);

Route::get('/gallery-images', [GalleryImageController::class, 'index']);
Route::get('/gallery-images/{id}', [GalleryImageController::class, 'show'])->whereNumber('id');

// No account needed, so a visitor is held to a handful of suggestions a minute.
Route::post('/suggestions', [SuggestionController::class, 'store'])->middleware('throttle:5,1');

Route::prefix('/seo')->group(function () {
    Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
    Route::get('/robots.txt', [SeoController::class, 'robots']);
    Route::get('/llms.txt', [SeoController::class, 'llms']);
});

Route::controller(OptionController::class)->prefix('/options')->group(function () {
    Route::get('/multi-type-settings/type', 'getMultiTypeSettingType');
    Route::get('/users/gender', 'getGenderType');
    Route::get('/users/type', 'getUserType');
    Route::get('/directory-entries/type', 'getDirectoryEntryType');
    Route::get('/events/type', 'getEventType');
    Route::get('/suggestions/type', 'getSuggestionType');
    Route::get('/suggestions/status', 'getSuggestionStatus');
    Route::get('/areas', 'getAreas');
    Route::get('/blog-categories', 'getBlogCategories');
});

// Dormant shop catalog.
if (Features::ecommerce()) {
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/slug/{slug}', [BrandController::class, 'getBySlug']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/slug/{slug}', [CategoryController::class, 'getBySlug']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/tags/slug/{slug}', [TagController::class, 'getBySlug']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
}
