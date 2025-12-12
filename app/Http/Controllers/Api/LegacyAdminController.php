<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Admin Controller for Legacy Frontend
 * Maps admin endpoints from Node.js to Laravel
 */
class LegacyAdminController extends Controller
{
    /**
     * POST /api/admin/login
     * Admin login (legacy format)
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !$admin->verifyPassword($request->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        // Revoke all previous tokens
        $admin->tokens()->delete();

        // Create new token
        $token = $admin->createToken('admin-token')->plainTextToken;

        // Return legacy format (direct token, not nested)
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token, // Direct token key for frontend
            'admin' => [
                'id' => $admin->id,
                'username' => $admin->username,
            ],
        ]);
    }

    /**
     * GET /api/admin/orders/all
     * Get all orders (legacy format)
     */
    public function getAllOrders(Request $request)
    {
        $query = Order::with(['items.menu', 'table']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by table if provided
        if ($request->has('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        $orders = $query->latest()->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'tracking_code' => $order->tracking_code,
                'customer_name' => $order->customer_name,
                'table_id' => $order->table_id,
                'table_name' => $order->table->name ?? "Meja {$order->table_id}",
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'createdAt' => $order->created_at, // Alias for frontend
                'Table' => [
                    'id' => $order->table->id ?? $order->table_id,
                    'name' => $order->table->name ?? "Meja {$order->table_id}",
                ],
                'OrderItems' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'qty' => $item->quantity, // Alias
                        'price' => $item->price,
                        'menu_name' => $item->menu->name ?? '',
                        'Menu' => [
                            'id' => $item->menu->id ?? null,
                            'name' => $item->menu->name ?? '',
                            'image' => $item->menu->image ?? null,
                        ],
                    ];
                }),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->menu->name ?? '',
                        'quantity' => $item->quantity,
                        'image' => $item->menu->image ?? null,
                    ];
                }),
            ];
        });

        // Return with data wrapper
        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * PUT /api/admin/orders/:id/status
     * Update order status (legacy format)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Menunggu Pembayaran,Sedang Disiapkan,Siap Disajikan,Selesai,Dibatalkan',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diupdate',
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
            ],
        ]);
    }

    /**
     * GET /api/admin/orders/history
     * Get order history (legacy format)
     */
    public function getOrderHistory(Request $request)
    {
        $query = Order::with(['items.menu', 'table']);

        // Filter completed orders only
        $query->whereIn('status', ['Selesai', 'Dibatalkan']);

        // Date filter if provided
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $orders = $query->latest()->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'tracking_code' => $order->tracking_code,
                'customer_name' => $order->customer_name,
                'table_id' => $order->table_id,
                'table_name' => $order->table->name ?? "Meja {$order->table_id}",
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'items' => $order->items->map(function ($item) {
                    return [
                        'menu_name' => $item->menu->name ?? '',
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->quantity * $item->price,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
    
    /**
     * GET /api/admin/menus
     * Get all menus for admin management
     */
    public function getMenus(Request $request)
    {
        $query = Menu::query();
        
        // Optional filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $menus = $query->latest()->get()->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'description' => $menu->description,
                'category' => $menu->category,
                'image' => $menu->image,
                'status' => $menu->status,
                'created_at' => $menu->created_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }
    
    /**
     * POST /api/admin/menus
     * Create new menu item
     */
    public function createMenu(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => ['required', Rule::in(['Makanan', 'Minuman', 'Ice Cream', 'Es Krim'])],
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'status' => ['required', Rule::in(['Tersedia', 'Habis'])],
        ]);
        
        // Normalize category
        if ($validated['category'] === 'Ice Cream') {
            $validated['category'] = 'Es Krim';
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menus', 'public');
        }
        
        $menu = Menu::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'description' => $menu->description,
                'category' => $menu->category,
                'image' => $menu->image,
                'status' => $menu->status,
            ],
        ], 201);
    }
    
    /**
     * PUT /api/admin/menus/:id
     * Update menu item
     */
    public function updateMenu(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => ['required', Rule::in(['Makanan', 'Minuman', 'Ice Cream', 'Es Krim'])],
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'status' => ['required', Rule::in(['Tersedia', 'Habis'])],
        ]);
        
        // Normalize category
        if (isset($validated['category']) && $validated['category'] === 'Ice Cream') {
            $validated['category'] = 'Es Krim';
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $validated['image'] = $request->file('image')->store('menus', 'public');
        }
        
        $menu->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate',
            'data' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'description' => $menu->description,
                'category' => $menu->category,
                'image' => $menu->image,
                'status' => $menu->status,
            ],
        ]);
    }
    
    /**
     * DELETE /api/admin/menus/:id
     * Delete menu item
     */
    public function deleteMenu($id)
    {
        $menu = Menu::findOrFail($id);
        
        // Delete image if exists
        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }
        
        $menu->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus',
        ]);
    }
    
    /**
     * GET /api/admin/tables
     * Get all tables for admin management
     */
    public function getTables()
    {
        $tables = Table::latest()->get()->map(function ($table) {
            return [
                'id' => $table->id,
                'name' => $table->name,
                'has_active_orders' => $table->hasActiveOrders(),
                'created_at' => $table->created_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }
    
    /**
     * POST /api/admin/tables
     * Create new table
     */
    public function createTable(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:tables,name|max:255',
        ]);
        
        $table = Table::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil ditambahkan',
            'data' => [
                'id' => $table->id,
                'name' => $table->name,
            ],
        ], 201);
    }
    
    /**
     * PUT /api/admin/tables/:id
     * Update table
     */
    public function updateTable(Request $request, $id)
    {
        $table = Table::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tables,name,' . $id,
        ]);
        
        $table->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil diupdate',
            'data' => [
                'id' => $table->id,
                'name' => $table->name,
            ],
        ]);
    }
    
    /**
     * DELETE /api/admin/tables/:id
     * Delete table (prevent if has active orders)
     */
    public function deleteTable($id)
    {
        $table = Table::findOrFail($id);
        
        // Check if table has active orders
        if ($table->hasActiveOrders()) {
            throw ValidationException::withMessages([
                'table' => ['Tidak dapat menghapus meja yang masih memiliki pesanan aktif.'],
            ]);
        }
        
        $table->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil dihapus',
        ]);
    }
}
