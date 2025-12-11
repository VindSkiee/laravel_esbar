<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        apiPrefix: 'api',
        then: function () {
            // Legacy API routes (compatibility with old frontend)
            Route::prefix('api')
                ->middleware('api')
                ->group(base_path('routes/legacy-api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Token-based API authentication (no stateful cookies for API routes)
        // Admin uses Bearer tokens, customers use sessionStorage

        $middleware->alias([
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'sanitize' => \App\Http\Middleware\SanitizeInput::class,
        ]);

        // Exclude CSRF for all API routes
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        
        // Global API middleware
        $middleware->api(append: [
            \App\Http\Middleware\SanitizeInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
