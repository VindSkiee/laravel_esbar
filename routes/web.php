<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    $path = public_path('frontend/index.html');
    if (File::exists($path)) {
        return response()->file($path, ['Content-Type' => 'text/html']);
    }
    return view('welcome');
});

// Fallback route to serve the frontend SPA from public/frontend/index.html
Route::fallback(function () {
    $path = public_path('frontend/index.html');
    if (File::exists($path)) {
        return File::get($path);
    }
    abort(404);
});
