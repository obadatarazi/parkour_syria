<?php

namespace App\Support;

/**
 * One place to ask whether a dormant part of the platform is switched on. @see config/features.php
 */
class Features
{
    public static function publicEnLocale(): bool
    {
        return (bool) config('features.public_en_locale', false);
    }

    public static function ecommerce(): bool
    {
        return (bool) config('features.ecommerce', false);
    }
}
