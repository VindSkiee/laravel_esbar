<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channel for admin to receive all order notifications
Broadcast::channel('admin-orders', function () {
    // No authentication needed, public channel
    return true;
});

// Private channel for each table to receive their specific order updates
Broadcast::channel('table.{tableId}', function ($user, $tableId) {
    // For now, allow all (since customers don't have authentication)
    // In production, you should verify session ownership
    return true;
});

