<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FeedComment extends Model
{
    protected $table = 'feed_comments';

    protected $fillable = [
        'post_id',
        'body',
        'author_type',
        'author_id',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The post this comment belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * The polymorphic author — either a StudentProfile or a Company instance.
     */
    public function author(): MorphTo
    {
        return $this->morphTo();
    }
}
