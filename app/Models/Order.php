<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'table_id',
        'customer_name',
        'payment_expires_at',
        'payment_transaction_id',
        'payment_qr_url',
        'payment_type',
        'paid_at',
        'status',
        'total',
        'tracking_code',
    ];

    protected $casts = [
        'payment_expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'total' => 'decimal:2',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Generate unique tracking code
    public static function generateTrackingCode()
    {
        do {
            $code = 'ESB-' . strtoupper(Str::random(5));
        } while (self::where('tracking_code', $code)->exists());

        return $code;
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope for today's orders
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // Scope for active orders (not completed or cancelled)
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['Menunggu Pembayaran', 'Sedang Disiapkan']);
    }

    // Check if order can be cancelled
    public function canBeCancelled()
    {
        return in_array($this->status, ['Menunggu Pembayaran', 'Sedang Disiapkan']);
    }

    // Check if payment is expired
    public function isPaymentExpired()
    {
        return $this->payment_expires_at && now()->isAfter($this->payment_expires_at);
    }

    // Check if order is paid
    public function isPaid()
    {
        return !is_null($this->paid_at);
    }
}
