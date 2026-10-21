<?php

use App\Command\InstallWebsiteCommand;
use App\Command\UpdateRolesCommand;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::group([], base_path('routes/website.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->use([HandleCors::class]);
        // `use()` replaces Laravel's global stack. Multipart forms cannot send null, so a cleared
        // nullable field (area_id, published_at, ...) arrives as '' and must become null here.
        $middleware->append(ConvertEmptyStringsToNull::class);
        $middleware->append(SetLocale::class);
        $middleware->alias([
            'active' => \App\Http\Middleware\EnsureAccountIsActive::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->withSingletons([
        \Illuminate\Contracts\Debug\ExceptionHandler::class => \App\Exceptions\Handler::class,
    ])
    ->withCommands([
        UpdateRolesCommand::class,
        InstallWebsiteCommand::class,
    ])
    ->create();
