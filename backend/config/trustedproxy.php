<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trusted proxies
    |--------------------------------------------------------------------------
    |
    | The load balancers or CDN in front of the API, read by Laravel's TrustProxies middleware. Only
    | their X-Forwarded-* headers are believed, which is what gives the rate limiter and the https
    | check the visitor's real address and scheme.
    |
    | A comma separated list of addresses or CIDR ranges, or "*" for whatever proxy calls the app.
    | Leave it empty when nothing sits in front of PHP: trusting a proxy that is not there lets any
    | client pick its own address with an X-Forwarded-For header, and dodge the login throttle.
    |
    */

    'proxies' => env('TRUSTED_PROXIES') ?: null,

];
