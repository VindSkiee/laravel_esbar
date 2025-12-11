<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'category',
        'image',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scope for filtering by category
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Scope for available menus
    public function scopeAvailable($query)
    {
        return $query->where('status', 'Tersedia');
    }

    // Get image URL
    public function getImageUrlAttribute()
    {
        return $this->image ? Storage::url($this->image) : null;
    }

    // Delete image when menu is deleted
    protected static function booted()
    {
        static::deleting(function ($menu) {
            if ($menu->image && Storage::exists($menu->image)) {
                Storage::delete($menu->image);
            }
        });
    }
}
