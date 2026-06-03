<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Post extends Model
{
    protected $table = 'posts';

    protected $fillable = [
        'body',
        'author_type',
        'author_id',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The polymorphic author — either a StudentProfile or a Company instance.
     */
    public function author(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Comments on this post.
     */
    public function feedComments(): HasMany
    {
        return $this->hasMany(FeedComment::class, 'post_id')->latest();
    }

    /**
     * Likes on this post.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class, 'post_id');
    }
}
