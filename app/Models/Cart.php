<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'table_id',
        'menu_id',
        'quantity',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    // Calculate subtotal for this cart item
    public function getSubtotalAttribute()
    {
        return $this->menu->price * $this->quantity;
    }

    // Get cart items by table
    public static function getByTable($tableId)
    {
        return self::with('menu')
            ->where('table_id', $tableId)
            ->get();
    }

    // Calculate total for a table's cart
    public static function getTotalByTable($tableId)
    {
        return self::where('table_id', $tableId)
            ->with('menu')
            ->get()
            ->sum(function($cart) {
                return $cart->menu->price * $cart->quantity;
            });
    }
}
