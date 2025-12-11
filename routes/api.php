<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\TableController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // ============================================
    // PUBLIC ROUTES (No Authentication Required)
    // ============================================
    
    // Admin Authentication (with rate limiting - 5 attempts per minute)
    Route::middleware(['throttle:5,1'])->group(function () {
        Route::post('/admin/login', [AuthController::class, 'login']);
    });
    
    // Customer Session Management
    Route::post('/session', [CartController::class, 'setSession']);
    Route::get('/session', [CartController::class, 'getSession']);
    
    // Menu Browsing (Customer)
    Route::get('/menus', [MenuController::class, 'index']);
    Route::get('/menus/{id}', [MenuController::class, 'show']);
    Route::get('/menus/categories/list', [MenuController::class, 'categories']);
    
    // Tables List (Customer - for selection)
    Route::get('/tables', [TableController::class, 'index']);
    Route::get('/tables/{id}', [TableController::class, 'show']);
    
    // Cart Management (Customer - Session-based)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Order Creation (Customer)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/tracking/{trackingCode}', [OrderController::class, 'showByTracking']);
    Route::get('/orders/history/table', [OrderController::class, 'historyByTable']);
    
    // Payment Webhook (Midtrans)
    Route::post('/payment/webhook', [PaymentController::class, 'webhook']);
    
    // ============================================
    // ADMIN PROTECTED ROUTES (Requires Authentication)
    // ============================================
    
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Admin Auth
        Route::post('/admin/logout', [AuthController::class, 'logout']);
        Route::get('/admin/me', [AuthController::class, 'me']);
        
        // Menu Management (Admin - CRUD)
        Route::post('/admin/menus', [MenuController::class, 'store']);
        Route::post('/admin/menus/{id}', [MenuController::class, 'update']); // POST for image upload
        Route::delete('/admin/menus/{id}', [MenuController::class, 'destroy']);
        
        // Table Management (Admin - CRUD)
        Route::post('/admin/tables', [TableController::class, 'store']);
        Route::put('/admin/tables/{id}', [TableController::class, 'update']);
        Route::delete('/admin/tables/{id}', [TableController::class, 'destroy']);
        
        // Order Management (Admin)
        Route::get('/admin/orders', [OrderController::class, 'index']);
        Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
        Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/admin/orders/{id}/cancel', [OrderController::class, 'cancel']);
        
        // Payment Management (Admin)
        Route::post('/admin/orders/{orderId}/payment', [PaymentController::class, 'createPayment']);
        Route::get('/admin/orders/{orderId}/payment/status', [PaymentController::class, 'checkStatus']);
        
        // Dashboard & Reports (Admin)
        Route::get('/admin/dashboard/statistics', [DashboardController::class, 'statistics']);
        Route::get('/admin/dashboard/active-orders', [DashboardController::class, 'activeOrders']);
        Route::get('/admin/dashboard/revenue-report', [DashboardController::class, 'revenueReport']);
        Route::get('/admin/dashboard/order-history', [DashboardController::class, 'orderHistory']);
    });
    
    // ============================================
    // CUSTOMER CAN ALSO ACCESS (No admin required)
    // ============================================
    
    // Payment Creation (Customer can create payment for their order)
    Route::post('/orders/{orderId}/payment', [PaymentController::class, 'createPayment']);
    Route::get('/orders/{orderId}/payment/status', [PaymentController::class, 'checkStatus']);
    
    // Order Cancellation (Customer can cancel their own order)
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});
