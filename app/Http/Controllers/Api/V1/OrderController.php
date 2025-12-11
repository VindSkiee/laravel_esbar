<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Events\OrderCreatedEvent;
use App\Events\OrderStatusUpdatedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Create order from cart (Checkout)
     */
    public function store(Request $request)
    {
        // Ensure session exists
        if (!session()->has('table_id')) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan. Silakan pilih meja terlebih dahulu.'],
            ]);
        }

        $tableId = session('table_id');
        $customerName = session('customer_name');

        // Get cart items
        $carts = Cart::with('menu')->where('table_id', $tableId)->get();

        if ($carts->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Keranjang kosong. Tambahkan menu terlebih dahulu.'],
            ]);
        }

        // Calculate total
        $total = $carts->sum(function ($cart) {
            return $cart->menu->price * $cart->quantity;
        });

        // Create order
        DB::beginTransaction();
        try {
            $order = Order::create([
                'table_id' => $tableId,
                'customer_name' => $customerName,
                'total' => $total,
                'tracking_code' => Order::generateTrackingCode(),
                'status' => 'Menunggu Pembayaran',
            ]);

            // Create order items
            foreach ($carts as $cart) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $cart->menu_id,
                    'quantity' => $cart->quantity,
                    'price' => $cart->menu->price,
                ]);
            }

            // Clear cart
            Cart::where('table_id', $tableId)->delete();

            DB::commit();

            // Load relationships
            $order->load(['items.menu', 'table']);

            // Broadcast order created event
            event(new OrderCreatedEvent($order));

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat',
                'data' => $this->formatOrder($order),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get order by tracking code
     */
    public function showByTracking($trackingCode)
    {
        $order = Order::with(['items.menu', 'table'])
            ->where('tracking_code', $trackingCode)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->formatOrder($order),
        ]);
    }

    /**
     * Get order by ID (Admin)
     */
    public function show($id)
    {
        $order = Order::with(['items.menu', 'table'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->formatOrder($order),
        ]);
    }

    /**
     * Get all orders with filters (Admin)
     */
    public function index(Request $request)
    {
        $query = Order::with(['items.menu', 'table']);

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Filter by table
        if ($request->has('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        // Get active orders only
        if ($request->has('active') && $request->active) {
            $query->active();
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->map(fn($order) => $this->formatOrder($order)),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    /**
     * Update order status (Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Menunggu Pembayaran,Sedang Disiapkan,Selesai,Dibatalkan',
        ]);

        $oldStatus = $order->status;
        $order->status = $validated['status'];
        $order->save();

        // Broadcast status update event
        event(new OrderStatusUpdatedEvent($order, $oldStatus));

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diupdate',
            'data' => $this->formatOrder($order->load(['items.menu', 'table'])),
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if (!$order->canBeCancelled()) {
            throw ValidationException::withMessages([
                'order' => ['Order tidak dapat dibatalkan. Status: ' . $order->status],
            ]);
        }

        $oldStatus = $order->status;
        $order->status = 'Dibatalkan';
        $order->save();

        // Broadcast cancellation event
        event(new OrderStatusUpdatedEvent($order, $oldStatus));

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dibatalkan',
            'data' => $this->formatOrder($order->load(['items.menu', 'table'])),
        ]);
    }

    /**
     * Get order history by table (Customer)
     */
    public function historyByTable()
    {
        if (!session()->has('table_id')) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan.'],
            ]);
        }

        $orders = Order::with(['items.menu', 'table'])
            ->where('table_id', session('table_id'))
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders->map(fn($order) => $this->formatOrder($order)),
        ]);
    }

    /**
     * Format order for response
     */
    private function formatOrder($order)
    {
        return [
            'id' => $order->id,
            'tracking_code' => $order->tracking_code,
            'customer_name' => $order->customer_name,
            'table' => [
                'id' => $order->table->id,
                'name' => $order->table->name,
            ],
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'menu' => [
                        'id' => $item->menu->id,
                        'name' => $item->menu->name,
                        'category' => $item->menu->category,
                    ],
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                ];
            }),
            'total' => $order->total,
            'status' => $order->status,
            'payment_type' => $order->payment_type,
            'payment_expires_at' => $order->payment_expires_at,
            'paid_at' => $order->paid_at,
            'is_paid' => $order->isPaid(),
            'can_be_cancelled' => $order->canBeCancelled(),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }
}

