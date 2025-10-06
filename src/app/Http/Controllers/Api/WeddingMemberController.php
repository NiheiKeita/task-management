<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeddingMember;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WeddingMemberController extends Controller
{
    public function index(): JsonResponse
    {
        $members = WeddingMember::all();
        return response()->json($members);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
        ]);

        $member = WeddingMember::create($validated);
        return response()->json($member, 201);
    }

    public function show(WeddingMember $weddingMember): JsonResponse
    {
        return response()->json($weddingMember);
    }

    public function update(Request $request, WeddingMember $weddingMember): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|nullable|string|max:255',
        ]);

        $weddingMember->update($validated);
        return response()->json($weddingMember);
    }

    public function destroy(WeddingMember $weddingMember): JsonResponse
    {
        $weddingMember->delete();
        return response()->json(null, 204);
    }
}
