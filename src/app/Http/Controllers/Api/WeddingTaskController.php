<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeddingTask;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WeddingTaskController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = WeddingTask::with('category')->get();
        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:wedding_categories,id',
            'emoji' => 'required|string|max:10',
            'status' => 'sometimes|in:not_started,in_progress,done',
            'is_done' => 'sometimes|boolean',
            'due' => 'nullable|date',
            'notes' => 'nullable|string',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:wedding_members,id',
        ]);

        $task = WeddingTask::create($validated);
        $task->load('category');

        return response()->json($task, 201);
    }

    public function show(WeddingTask $weddingTask): JsonResponse
    {
        $weddingTask->load('category');
        return response()->json($weddingTask);
    }

    public function update(Request $request, WeddingTask $weddingTask): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:wedding_categories,id',
            'emoji' => 'sometimes|string|max:10',
            'status' => 'sometimes|in:not_started,in_progress,done',
            'is_done' => 'sometimes|boolean',
            'due' => 'nullable|date',
            'notes' => 'nullable|string',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:wedding_members,id',
        ]);

        $weddingTask->update($validated);
        $weddingTask->load('category');

        return response()->json($weddingTask);
    }

    public function destroy(WeddingTask $weddingTask): JsonResponse
    {
        $weddingTask->delete();
        return response()->json(null, 204);
    }
}
