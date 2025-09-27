<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeddingCategory extends Model
{
    protected $fillable = [
        'name',
        'accent',
        'emoji',
    ];

    /**
     * @return HasMany<WeddingTask, $this>
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(WeddingTask::class, 'category_id');
    }
}
