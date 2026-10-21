<?php

return [

    /*
     * The multi type settings GET /api/site-settings hands to the website. Anything not listed here
     * is internal and stays behind the admin API.
     */
    'public_settings' => [
        'site_name',
        'default_locale',
        'whatsapp_number',
        'whatsapp_display',
        'whatsapp_book_message',
        'facebook_url',
        'facebook_handle',
        'instagram_url',
        'instagram_handle',
        'email',
        'safety_notice_short',
        'safety_notice_directory',
    ],

    /*
     * How many items each rail of GET /api/home carries.
     */
    'home' => [
        'sliders' => 5,
        'latest_blog_posts' => 3,
        'upcoming_events' => 3,
        'featured_directory_entries' => 6,
        'gallery_images' => 8,
    ],

    /*
     * The website's own paths (src/components/nav.tsx on the SPA), so the sitemap links to pages
     * that exist. Detail pages are `{list}/{slug}`.
     */
    'website_paths' => [
        'home' => '/',
        'what' => '/what-is-parkour',
        'path' => '/path',
        'directory' => '/directory',
        'events' => '/events',
        'suggest' => '/suggest',
        'blog' => '/blog',
        'book' => '/book',
        'about' => '/about',
        'contact' => '/contact',
        'disclaimer' => '/disclaimer',
    ],

    /*
     * Laravel serves the website's HTML (scope section 7a): the built SPA's index.html with each
     * page's title, description, Open Graph, JSON-LD and a prerendered copy of its content injected.
     * `php artisan website:install ../dist` copies a build into place.
     */
    'website' => [
        // The built index.html. Falls back to the repo's own dist/ so a local build works untouched.
        'index_path' => env('WEBSITE_INDEX_PATH', storage_path('app/website/index.html')),
        'dev_index_path' => base_path('../dist/index.html'),

        // Folder the site lives under on this host, e.g. "/parkour". Empty when it is the domain root.
        'base_path' => env('WEBSITE_BASE_PATH', ''),

        // Image used by Open Graph when a page has none of its own.
        'default_image' => env('WEBSITE_DEFAULT_IMAGE', 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop'),

        'cache_seconds' => (int) env('WEBSITE_HTML_CACHE_SECONDS', 600),
    ],

];
