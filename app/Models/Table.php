<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $fillable = [
        'name',
    ];

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Check if table has active orders
    public function hasActiveOrders()
    {
        return $this->orders()
            ->whereIn('status', ['Menunggu Pembayaran', 'Sedang Disiapkan'])
            ->exists();
    }
}
