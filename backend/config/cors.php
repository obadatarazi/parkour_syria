<?php

/*
 * Only the website and the dashboard call the API from a browser. CORS_ALLOWED_ORIGINS, a comma
 * separated list, replaces the two defaults (add a www. host or a local dev server there).
 */
$origins = env('CORS_ALLOWED_ORIGINS')
    ?: implode(',', [
        env('WEBSITE_BASE_URL', 'https://parkoursyria.com'),
        env('ADMIN_DASHBOARD_BASE_URL', 'https://admin.parkoursyria.com'),
    ]);

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
    'allowed_origins' => array_values(array_filter(array_map(
        fn (string $origin) => rtrim(trim($origin), '/'),
        explode(',', $origins),
    ))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
