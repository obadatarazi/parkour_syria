<?php

use App\Command\InstallWebsiteCommand;
use App\Command\UpdateRolesCommand;
use App\Exceptions\Handler;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::group([], base_path('routes/website.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Laravel's default global stack stays: trusted proxies (config/trustedproxy.php), CORS,
        // maintenance mode, post size, trimming, and ConvertEmptyStringsToNull, which turns a cleared
        // multipart field (area_id, published_at, ...) from '' into null.
        // Passwords are taken exactly as typed. The dashboard sends these keys in camelCase.
        $middleware->trimStrings(except: [
            'currentPassword',
            'newPassword',
            'newPasswordConfirmation',
            'current_password',
            'new_password',
            'new_password_confirmation',
        ]);
        $middleware->append(SecurityHeaders::class);
        $middleware->append(SetLocale::class);
        $middleware->alias([
            'active' => EnsureAccountIsActive::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->withSingletons([
        ExceptionHandler::class => Handler::class,
    ])
    ->withCommands([
        UpdateRolesCommand::class,
        InstallWebsiteCommand::class,
    ])
    ->create();
