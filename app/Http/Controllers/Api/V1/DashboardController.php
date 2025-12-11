<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function statistics(Request $request)
    {
        // Today's orders
        $todayOrders = Order::today()->count();

        // Today's revenue
        $todayRevenue = Order::today()
            ->whereNotNull('paid_at')
            ->sum('total');

        // Active orders (Menunggu Pembayaran + Sedang Disiapkan)
        $activeOrders = Order::active()->count();

        // Total revenue all time
        $totalRevenue = Order::whereNotNull('paid_at')->sum('total');

        // Orders by status today
        $ordersByStatus = Order::today()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Top selling menus
        $topMenus = OrderItem::select('menu_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(price * quantity) as total_revenue'))
            ->with('menu')
            ->whereHas('order', function ($query) {
                $query->whereNotNull('paid_at');
            })
            ->groupBy('menu_id')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'menu_id' => $item->menu_id,
                    'menu_name' => $item->menu->name,
                    'category' => $item->menu->category,
                    'total_quantity' => $item->total_quantity,
                    'total_revenue' => $item->total_revenue,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
                'active_orders' => $activeOrders,
                'total_revenue' => $totalRevenue,
                'orders_by_status' => $ordersByStatus,
                'top_menus' => $topMenus,
            ],
        ]);
    }

    /**
     * Get real-time active orders
     */
    public function activeOrders()
    {
        $orders = Order::with(['items.menu', 'table'])
            ->active()
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'tracking_code' => $order->tracking_code,
                    'customer_name' => $order->customer_name,
                    'table_name' => $order->table->name,
                    'total' => $order->total,
                    'status' => $order->status,
                    'items_count' => $order->items->count(),
                    'is_paid' => $order->isPaid(),
                    'created_at' => $order->created_at,
                ];
            }),
        ]);
    }

    /**
     * Get revenue report by date range
     */
    public function revenueReport(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $orders = Order::whereBetween('created_at', [$validated['start_date'], $validated['end_date']])
            ->whereNotNull('paid_at')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalRevenue = $orders->sum('revenue');
        $totalOrders = $orders->sum('total_orders');

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                ],
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'average_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
                ],
                'daily_data' => $orders,
            ],
        ]);
    }

    /**
     * Get order history with filters
     */
    public function orderHistory(Request $request)
    {
        $query = Order::with(['items.menu', 'table']);

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by table
        if ($request->has('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        $perPage = $request->input('per_page', 10);
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'tracking_code' => $order->tracking_code,
                    'customer_name' => $order->customer_name,
                    'table_name' => $order->table->name,
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_type' => $order->payment_type,
                    'is_paid' => $order->isPaid(),
                    'created_at' => $order->created_at,
                ];
            }),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }
}

