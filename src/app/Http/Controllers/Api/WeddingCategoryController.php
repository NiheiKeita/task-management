<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeddingCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WeddingCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = WeddingCategory::all();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'accent' => 'required|string|max:50',
            'emoji' => 'required|string|max:10',
        ]);

        $category = WeddingCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show(WeddingCategory $weddingCategory): JsonResponse
    {
        return response()->json($weddingCategory);
    }

    public function update(Request $request, WeddingCategory $weddingCategory): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'accent' => 'sometimes|string|max:50',
            'emoji' => 'sometimes|string|max:10',
        ]);

        $weddingCategory->update($validated);
        return response()->json($weddingCategory);
    }

    public function destroy(WeddingCategory $weddingCategory): JsonResponse
    {
        $weddingCategory->delete();
        return response()->json(null, 204);
    }
}
