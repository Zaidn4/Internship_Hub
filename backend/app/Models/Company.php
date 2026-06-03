<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Company extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'company_name',
        'description',
        'website',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }

    /**
     * Community feed posts authored by this company.
     */
    public function posts(): MorphMany
    {
        return $this->morphMany(Post::class, 'author');
    }

    /**
     * Community feed comments authored by this company.
     */
    public function feedComments(): MorphMany
    {
        return $this->morphMany(FeedComment::class, 'author');
    }
}
