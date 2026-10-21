<?php

namespace App\Http\Middleware;

use App\Support\Features;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['en', 'ar'];

    private const PUBLIC_DEFAULT = 'ar';

    /**
     * Handle an incoming request.
     *
     * The dashboard (/api/admin/*) may ask for any supported locale. The public website is Arabic
     * only until FEATURE_PUBLIC_EN_LOCALE is switched on, whatever X-Locale it sends, so English
     * content can be filled in ahead of time without leaking to visitors.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = strtolower(trim((string) $request->header('X-Locale', '')));

        if (!in_array($locale, self::SUPPORTED, true)) {
            $locale = config('app.locale', self::PUBLIC_DEFAULT);
        }

        if (!$this->isAdminRequest($request) && !Features::publicEnLocale()) {
            $locale = self::PUBLIC_DEFAULT;
        }

        // Keep App and Request in sync — `$request->getLocale()` defaults to `en` and
        // would otherwise win over `App::getLocale()` in `?:` fallbacks.
        App::setLocale($locale);
        $request->setLocale($locale);

        return $next($request);
    }

    private function isAdminRequest(Request $request): bool
    {
        return $request->is('api/admin', 'api/admin/*');
    }
}
