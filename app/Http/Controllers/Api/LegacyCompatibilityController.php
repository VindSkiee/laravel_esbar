<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table as TableModel;
use App\Events\OrderCreatedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Legacy Compatibility Controller
 * Maps old Node.js API endpoints to Laravel backend
 * For frontend-esbar79 React app compatibility
 */
class LegacyCompatibilityController extends Controller
{
    /**
     * POST /api/table/set
     * Set table session (legacy format)
     */
    public function setTable(Request $request)
    {
        $request->validate([
            'table_id' => 'required|integer',
            'table_name' => 'nullable|string',
        ]);

        $tableId = $request->table_id;
        
        // Set session
        session([
            'table_id' => $tableId,
            'customer_name' => $request->input('customer_name', 'Guest'),
        ]);

        // Find table
        $table = TableModel::find($tableId);

        return response()->json([
            'success' => true,
            'message' => 'Table set successfully',
            'table' => [
                'id' => $tableId,
                'name' => $table ? $table->name : "Meja {$tableId}",
            ],
        ]);
    }

    /**
     * GET /api/table/list
     * Get all tables (legacy format)
     */
    public function getTables()
    {
        $tables = TableModel::orderBy('name')->get(['id', 'name']);
        
        // Return direct array (not wrapped)
        return response()->json($tables);
    }

    /**
     * GET /api/menu
     * Get all menus (legacy format with optional nested data)
     */
    public function getMenus(Request $request)
    {
        $query = Menu::where('status', 'Tersedia');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $menus = $query->get()->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'category' => $menu->category,
                'image' => $menu->image ? "/storage/{$menu->image}" : null,
                'status' => $menu->status,
            ];
        });

        // Return with data wrapper for compatibility
        return response()->json([
            'data' => $menus
        ]);
    }

    /**
     * GET /api/cart
     * Get cart items (legacy format)
     */
    public function getCart(Request $request)
    {
        // Get table_id from query param or session
        $tableId = $request->query('table_id') ?? $request->input('table_id') ?? session('table_id');
        
        if (!$tableId) {
            return response()->json([]);
        }
        
        // Update session if provided
        if ($request->has('table_id')) {
            session(['table_id' => $tableId]);
        }

        $carts = Cart::where('table_id', $tableId)
            ->with('menu')
            ->get()
            ->map(function ($cart) {
                return [
                    'id' => $cart->id,
                    'menu_id' => $cart->menu_id,
                    'quantity' => $cart->quantity,
                    'created_at' => $cart->created_at,
                ];
            });

        // Return direct array (not wrapped)
        return response()->json($carts);
    }

    /**
     * POST /api/cart/add
     * Add item to cart (legacy format)
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|integer|exists:menus,id',
            'quantity' => 'required|integer|min:1',
            'table_id' => 'nullable|integer|exists:tables,id',
        ]);

        // Get table_id from request or session
        $tableId = $request->input('table_id') ?? session('table_id');
        
        if (!$tableId) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan. Silakan pilih meja terlebih dahulu.'],
            ]);
        }
        
        // Update session
        session(['table_id' => $tableId]);

        $menuId = $request->menu_id;
        $quantity = $request->quantity;

        // Check if item already in cart
        $cart = Cart::where('table_id', $tableId)
            ->where('menu_id', $menuId)
            ->first();

        if ($cart) {
            // Update quantity
            $cart->quantity += $quantity;
            $cart->save();
        } else {
            // Create new cart item
            Cart::create([
                'table_id' => $tableId,
                'menu_id' => $menuId,
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
        ]);
    }

    /**
     * PUT /api/cart/update
     * Update cart item quantity (legacy format)
     */
    public function updateCart(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|integer',
            'quantity' => 'required|integer|min:0',
            'table_id' => 'nullable|integer|exists:tables,id',
        ]);

        $tableId = $request->input('table_id') ?? session('table_id');
        
        if (!$tableId) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan.'],
            ]);
        }
        
        // Update session
        session(['table_id' => $tableId]);

        $cart = Cart::where('table_id', $tableId)
            ->where('menu_id', $request->menu_id)
            ->first();

        if (!$cart) {
            throw ValidationException::withMessages([
                'cart' => ['Item tidak ditemukan di keranjang.'],
            ]);
        }

        if ($request->quantity <= 0) {
            $cart->delete();
        } else {
            $cart->quantity = $request->quantity;
            $cart->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
        ]);
    }

    /**
     * DELETE /api/cart/remove
     * Remove item from cart (legacy format)
     */
    public function removeFromCart(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|integer',
            'table_id' => 'nullable|integer|exists:tables,id',
        ]);

        $tableId = $request->input('table_id') ?? session('table_id');
        
        if (!$tableId) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan.'],
            ]);
        }
        
        // Update session
        session(['table_id' => $tableId]);

        Cart::where('table_id', $tableId)
            ->where('menu_id', $request->menu_id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
        ]);
    }

    /**
     * DELETE /api/cart/clear
     * Clear all cart items (legacy format)
     */
    public function clearCart(Request $request)
    {
        $tableId = $request->input('table_id') ?: session('table_id');
        
        if (!$tableId) {
            return response()->json([
                'success' => true,
                'message' => 'No cart to clear',
            ]);
        }

        Cart::where('table_id', $tableId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }

    /**
     * POST /api/order/create
     * Create order (legacy format)
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'order_type' => 'nullable|string',
        ]);

        $tableId = $request->input('table_id') ?? session('table_id');
        $customerName = $request->customer_name;

        if (!$tableId) {
            throw ValidationException::withMessages([
                'table_id' => ['Table ID diperlukan.'],
            ]);
        }

        // Get cart items
        $carts = Cart::with('menu')->where('table_id', $tableId)->get();

        if ($carts->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Keranjang kosong.'],
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

            // Broadcast event (temporarily disabled for testing without Reverb)
            // event(new OrderCreatedEvent($order));

            // Return legacy format
            return response()->json([
                'success' => true,
                'id' => $order->id,
                'tracking_code' => $order->tracking_code,
                'total' => $order->total,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'table_id' => $order->table_id,
                'created_at' => $order->created_at,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * POST /api/payment/initiate/:orderId
     * Initiate payment (legacy format - mock)
     */
    public function initiatePayment($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Generate mock QR code (base64 placeholder)
        $qrString = 'data:image/svg+xml;base64,' . base64_encode(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
                <rect width="200" height="200" fill="white"/>
                <text x="100" y="100" text-anchor="middle" font-size="16" fill="black">
                    QR Code: ' . $order->tracking_code . '
                </text>
            </svg>'
        );

        return response()->json([
            'success' => true,
            'qr_string' => $qrString,
            'order_id' => $order->id,
            'tracking_code' => $order->tracking_code,
            'amount' => $order->total,
        ]);
    }

    /**
     * POST /api/payment/test-confirm/:orderId
     * Test confirm payment (legacy format - sandbox)
     */
    public function testConfirmPayment($orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->isPaid()) {
            return response()->json([
                'success' => true,
                'message' => 'Order already paid',
            ]);
        }

        // Mark as paid
        $order->paid_at = now();
        $order->status = 'Sedang Disiapkan';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed (test mode)',
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
                'paid_at' => $order->paid_at,
            ],
        ]);
    }
}
