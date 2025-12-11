<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    /**
     * Display a listing of menus (Customer & Admin)
     * With optional category filter
     */
    public function index(Request $request)
    {
        $query = Menu::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status (for customer, show only available)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } elseif (!$request->user()) {
            // For guest/customer, only show available menus
            $query->available();
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $menus = $query->latest()->get()->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'description' => $menu->description,
                'category' => $menu->category,
                'image' => $menu->image ? '/storage/' . $menu->image : null,
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
     * Show single menu detail
     */
    public function show($id)
    {
        $menu = Menu::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'description' => $menu->description,
                'category' => $menu->category,
                'image' => $menu->image ? '/storage/' . $menu->image : null,
                'status' => $menu->status,
                'created_at' => $menu->created_at,
            ],
        ]);
    }

    /**
     * Store new menu (Admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => ['required', Rule::in(['Makanan', 'Minuman', 'Es Krim'])],
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120', // 5MB max
            'status' => ['required', Rule::in(['Tersedia', 'Habis'])],
        ]);

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
                'image' => $menu->image ? asset('storage/' . $menu->image) : null,
                'status' => $menu->status,
            ],
        ], 201);
    }

    /**
     * Update existing menu (Admin only)
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => ['sometimes', 'required', Rule::in(['Makanan', 'Minuman', 'Es Krim'])],
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'status' => ['sometimes', 'required', Rule::in(['Tersedia', 'Habis'])],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($menu->image && Storage::disk('public')->exists($menu->image)) {
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
                'image' => $menu->image ? asset('storage/' . $menu->image) : null,
                'status' => $menu->status,
            ],
        ]);
    }

    /**
     * Delete menu (Admin only)
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);

        // Delete image from storage
        if ($menu->image && Storage::disk('public')->exists($menu->image)) {
            Storage::disk('public')->delete($menu->image);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus',
        ]);
    }

    /**
     * Get menu categories
     */
    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => ['Makanan', 'Minuman', 'Es Krim'],
        ]);
    }
}

