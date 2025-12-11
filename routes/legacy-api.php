<?php

use App\Http\Controllers\Api\LegacyCompatibilityController;
use App\Http\Controllers\Api\LegacyAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Legacy API Routes
|--------------------------------------------------------------------------
| 
| Routes untuk kompatibilitas dengan frontend React lama
| Mapping endpoint Node.js ke Laravel backend
|
*/

// Admin Authentication
Route::post('/admin/login', [LegacyAdminController::class, 'login']);

// Admin Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Orders Management
    Route::get('/admin/orders/all', [LegacyAdminController::class, 'getAllOrders']);
    Route::put('/admin/orders/{id}/status', [LegacyAdminController::class, 'updateOrderStatus']);
    Route::get('/admin/orders/history', [LegacyAdminController::class, 'getOrderHistory']);
    
    // Menu Management
    Route::get('/admin/menus', [LegacyAdminController::class, 'getMenus']);
    Route::post('/admin/menus', [LegacyAdminController::class, 'createMenu']);
    Route::put('/admin/menus/{id}', [LegacyAdminController::class, 'updateMenu']);
    Route::delete('/admin/menus/{id}', [LegacyAdminController::class, 'deleteMenu']);
    
    // Table Management
    Route::get('/admin/tables', [LegacyAdminController::class, 'getTables']);
    Route::post('/admin/tables', [LegacyAdminController::class, 'createTable']);
    Route::put('/admin/tables/{id}', [LegacyAdminController::class, 'updateTable']);
    Route::delete('/admin/tables/{id}', [LegacyAdminController::class, 'deleteTable']);
});

// Table Management (Customer Session) - No CSRF required
Route::withoutMiddleware([\App\Http\Middleware\ValidateCsrfToken::class])->group(function () {
    Route::post('/table/set', [LegacyCompatibilityController::class, 'setTable']);
});

Route::get('/table/list', [LegacyCompatibilityController::class, 'getTables']);

// Menu Catalog
Route::get('/menu', [LegacyCompatibilityController::class, 'getMenus']);

// Cart Management
Route::get('/cart', [LegacyCompatibilityController::class, 'getCart']);
Route::post('/cart/add', [LegacyCompatibilityController::class, 'addToCart']);
Route::put('/cart/update', [LegacyCompatibilityController::class, 'updateCart']);
Route::delete('/cart/remove', [LegacyCompatibilityController::class, 'removeFromCart']);
Route::delete('/cart/clear', [LegacyCompatibilityController::class, 'clearCart']);

// Order Management
Route::post('/order/create', [LegacyCompatibilityController::class, 'createOrder']);

// Payment (Sandbox/Test Mode)
Route::post('/payment/initiate/{orderId}', [LegacyCompatibilityController::class, 'initiatePayment']);
Route::post('/payment/test-confirm/{orderId}', [LegacyCompatibilityController::class, 'testConfirmPayment']);
