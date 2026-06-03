<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function students(): BelongsToMany
    {
        // Mirror the explicit keys from StudentProfile::skills() so both
        // sides of the relationship resolve to the correct pivot columns.
        return $this->belongsToMany(StudentProfile::class, 'skill_student', 'skill_id', 'student_id');
    }

    public function internships(): BelongsToMany
    {
        return $this->belongsToMany(Internship::class, 'internship_skill');
    }
}
