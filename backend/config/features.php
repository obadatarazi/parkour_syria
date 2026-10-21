<?php

/*
|--------------------------------------------------------------------------
| Feature flags
|--------------------------------------------------------------------------
|
| Parts of the platform that are built but not live yet. Flipping one on is a config change, the
| schema and the code behind it are already in place.
|
*/

return [

    /*
     * When off, every public (non /api/admin) request is answered in Arabic whatever X-Locale it
     * sends. The dashboard can still read and write the English translations.
     */
    'public_en_locale' => (bool) env('FEATURE_PUBLIC_EN_LOCALE', false),

    /*
     * When off, the shop routes (catalog, cart, orders, coupons) are not registered at all and the
     * shop permissions are left out of the role sync.
     */
    'ecommerce' => (bool) env('FEATURE_ECOMMERCE', false),

];
