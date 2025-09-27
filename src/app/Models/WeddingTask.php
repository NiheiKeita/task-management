<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingTask extends Model
{
    protected $fillable = [
        'title',
        'category_id',
        'emoji',
        'status',
        'is_done',
        'due',
        'notes',
        'assignee_ids',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'due' => 'date',
        'assignee_ids' => 'array',
    ];

    /**
     * @return BelongsTo<WeddingCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(WeddingCategory::class, 'category_id');
    }
}
