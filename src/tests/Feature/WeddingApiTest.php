<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\WeddingCategory;
use App\Models\WeddingMember;
use App\Models\WeddingTask;

class WeddingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_and_list_categories(): void
    {
        $categoryData = [
            'name' => '前撮り',
            'accent' => 'sky',
            'emoji' => '📷',
        ];

        $response = $this->postJson('/api/wedding-categories', $categoryData);
        $response->assertStatus(201)
                ->assertJsonFragment($categoryData);

        $response = $this->getJson('/api/wedding-categories');
        $response->assertStatus(200)
                ->assertJsonCount(1)
                ->assertJsonFragment($categoryData);
    }

    public function test_can_create_and_list_members(): void
    {
        $memberData = [
            'name' => '花嫁',
            'role' => '花嫁',
        ];

        $response = $this->postJson('/api/wedding-members', $memberData);
        $response->assertStatus(201)
                ->assertJsonFragment($memberData);

        $response = $this->getJson('/api/wedding-members');
        $response->assertStatus(200)
                ->assertJsonCount(1)
                ->assertJsonFragment($memberData);
    }

    public function test_can_create_and_list_tasks(): void
    {
        $category = WeddingCategory::create([
            'name' => '前撮り',
            'accent' => 'sky',
            'emoji' => '📷',
        ]);

        $taskData = [
            'title' => '前撮りのスケジュール調整',
            'category_id' => $category->id,
            'emoji' => '📸',
            'status' => 'in_progress',
            'notes' => 'テスト用タスク',
        ];

        $response = $this->postJson('/api/wedding-tasks', $taskData);
        $response->assertStatus(201)
                ->assertJsonFragment([
                    'title' => $taskData['title'],
                    'emoji' => $taskData['emoji'],
                    'status' => $taskData['status'],
                ]);

        $response = $this->getJson('/api/wedding-tasks');
        $response->assertStatus(200)
                ->assertJsonCount(1);
    }

    public function test_can_update_task_status(): void
    {
        $category = WeddingCategory::create([
            'name' => '前撮り',
            'accent' => 'sky',
            'emoji' => '📷',
        ]);

        $task = WeddingTask::create([
            'title' => 'テストタスク',
            'category_id' => $category->id,
            'emoji' => '📸',
            'status' => 'not_started',
            'is_done' => false,
        ]);

        $updateData = [
            'status' => 'done',
            'is_done' => true,
        ];

        $response = $this->putJson("/api/wedding-tasks/{$task->id}", $updateData);
        $response->assertStatus(200)
                ->assertJsonFragment($updateData);
    }
}
