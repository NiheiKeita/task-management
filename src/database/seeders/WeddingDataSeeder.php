<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WeddingCategory;
use App\Models\WeddingMember;
use App\Models\WeddingTask;

class WeddingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            ['name' => '前撮り', 'accent' => 'sky', 'emoji' => '📷'],
            ['name' => '会場装飾', 'accent' => 'blush', 'emoji' => '🎀'],
            ['name' => 'ヘアメイク', 'accent' => 'lavender', 'emoji' => '💄'],
        ];

        $createdCategories = [];
        foreach ($categories as $categoryData) {
            $category = WeddingCategory::create($categoryData);
            $createdCategories[$categoryData['name']] = $category;
        }

        // Create members
        $members = [
            ['name' => '花嫁', 'role' => '花嫁'],
            ['name' => '花婿', 'role' => '花婿'],
        ];

        $createdMembers = [];
        foreach ($members as $memberData) {
            $member = WeddingMember::create($memberData);
            $createdMembers[$memberData['name']] = $member;
        }

        // Create tasks
        $tasks = [
            [
                'title' => '前撮りのスケジュール調整',
                'category_id' => $createdCategories['前撮り']->id,
                'emoji' => '📸',
                'status' => 'in_progress',
                'is_done' => false,
                'due' => '2026-02-10',
                'assignee_ids' => [$createdMembers['花嫁']->id],
            ],
            [
                'title' => '会場装飾の打ち合わせ',
                'category_id' => $createdCategories['会場装飾']->id,
                'emoji' => '🎀',
                'status' => 'done',
                'is_done' => true,
                'due' => '2026-01-20',
                'assignee_ids' => [$createdMembers['花婿']->id],
            ],
        ];

        foreach ($tasks as $taskData) {
            WeddingTask::create($taskData);
        }
    }
}
