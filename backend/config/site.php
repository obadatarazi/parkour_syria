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

];
