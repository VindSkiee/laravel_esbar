<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Menu;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Set customer session (nama dan table)
     */
    public function setSession(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'table_id' => 'required|exists:tables,id',
        ]);

        // Store in session
        session([
            'customer_name' => $validated['customer_name'],
            'table_id' => $validated['table_id'],
        ]);

        $table = Table::find($validated['table_id']);

        return response()->json([
            'success' => true,
            'message' => 'Session berhasil diset',
            'data' => [
                'customer_name' => $validated['customer_name'],
                'table' => [
                    'id' => $table->id,
                    'name' => $table->name,
                ],
            ],
        ]);
    }

    /**
     * Get customer session
     */
    public function getSession(Request $request)
    {
        if (!session()->has('table_id')) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan. Silakan pilih meja terlebih dahulu.'],
            ]);
        }

        $table = Table::find(session('table_id'));

        return response()->json([
            'success' => true,
            'data' => [
                'customer_name' => session('customer_name'),
                'table' => [
                    'id' => $table->id,
                    'name' => $table->name,
                ],
            ],
        ]);
    }

    /**
     * Get all cart items for current session
     */
    public function index(Request $request)
    {
        $this->ensureSession();

        $tableId = session('table_id');
        $carts = Cart::with('menu')->where('table_id', $tableId)->get();

        $items = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'menu' => [
                    'id' => $cart->menu->id,
                    'name' => $cart->menu->name,
                    'price' => $cart->menu->price,
                    'category' => $cart->menu->category,
                    'image' => $cart->menu->image ? asset('storage/' . $cart->menu->image) : null,
                ],
                'quantity' => $cart->quantity,
                'subtotal' => $cart->menu->price * $cart->quantity,
            ];
        });

        $total = $items->sum('subtotal');

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $items,
                'total' => $total,
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function store(Request $request)
    {
        $this->ensureSession();

        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $tableId = session('table_id');

        // Check if menu is available
        $menu = Menu::findOrFail($validated['menu_id']);
        if ($menu->status !== 'Tersedia') {
            throw ValidationException::withMessages([
                'menu' => ['Menu tidak tersedia saat ini.'],
            ]);
        }

        // Check if item already exists in cart
        $existingCart = Cart::where('table_id', $tableId)
            ->where('menu_id', $validated['menu_id'])
            ->first();

        if ($existingCart) {
            // Update quantity
            $existingCart->quantity += $validated['quantity'];
            $existingCart->save();
            $cart = $existingCart;
        } else {
            // Create new cart item
            $cart = Cart::create([
                'table_id' => $tableId,
                'menu_id' => $validated['menu_id'],
                'quantity' => $validated['quantity'],
            ]);
        }

        $cart->load('menu');

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil ditambahkan ke keranjang',
            'data' => [
                'id' => $cart->id,
                'menu' => [
                    'id' => $cart->menu->id,
                    'name' => $cart->menu->name,
                    'price' => $cart->menu->price,
                ],
                'quantity' => $cart->quantity,
                'subtotal' => $cart->menu->price * $cart->quantity,
            ],
        ], 201);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, $id)
    {
        $this->ensureSession();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('table_id', session('table_id'))->findOrFail($id);
        $cart->quantity = $validated['quantity'];
        $cart->save();
        $cart->load('menu');

        return response()->json([
            'success' => true,
            'message' => 'Quantity berhasil diupdate',
            'data' => [
                'id' => $cart->id,
                'quantity' => $cart->quantity,
                'subtotal' => $cart->menu->price * $cart->quantity,
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy($id)
    {
        $this->ensureSession();

        $cart = Cart::where('table_id', session('table_id'))->findOrFail($id);
        $cart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus dari keranjang',
        ]);
    }

    /**
     * Clear all cart items
     */
    public function clear()
    {
        $this->ensureSession();

        Cart::where('table_id', session('table_id'))->delete();

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil dikosongkan',
        ]);
    }

    /**
     * Ensure customer session exists
     */
    private function ensureSession()
    {
        if (!session()->has('table_id')) {
            throw ValidationException::withMessages([
                'session' => ['Session tidak ditemukan. Silakan pilih meja terlebih dahulu.'],
            ]);
        }
    }
}

