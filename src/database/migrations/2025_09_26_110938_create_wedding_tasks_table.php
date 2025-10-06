<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wedding_tasks', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string('title');
            $table->foreignId('category_id')->constrained('wedding_categories')->onDelete('cascade');
            $table->string('emoji');
            $table->enum('status', ['not_started', 'in_progress', 'done'])->default('not_started');
            $table->boolean('is_done')->default(false);
            $table->date('due')->nullable();
            $table->text('notes')->nullable();
            $table->json('assignee_ids')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wedding_tasks');
    }
};
