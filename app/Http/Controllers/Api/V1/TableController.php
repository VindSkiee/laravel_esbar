<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    /**
     * Get all tables
     */
    public function index()
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
     * Get single table
     */
    public function show($id)
    {
        $table = Table::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $table->id,
                'name' => $table->name,
                'has_active_orders' => $table->hasActiveOrders(),
            ],
        ]);
    }

    /**
     * Create new table (Admin only)
     */
    public function store(Request $request)
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
     * Update table (Admin only)
     */
    public function update(Request $request, $id)
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
     * Delete table (Admin only)
     * Prevent delete if table has active orders
     */
    public function destroy($id)
    {
        $table = Table::findOrFail($id);

        if ($table->hasActiveOrders()) {
            throw ValidationException::withMessages([
                'table' => ['Tidak dapat menghapus meja yang memiliki pesanan aktif.'],
            ]);
        }

        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meja berhasil dihapus',
        ]);
    }
}

