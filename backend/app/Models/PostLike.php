<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PostLike extends Model
{
    protected $table = 'post_likes';

    protected $fillable = [
        'post_id',
        'liker_type',
        'liker_id',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function post(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * The polymorphic liker — either a StudentProfile or a Company.
     */
    public function liker(): MorphTo
    {
        return $this->morphTo();
    }
}
