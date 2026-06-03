<?php

namespace App\Policies;

use App\Models\Internship;
use App\Models\User;

class InternshipPolicy
{
    /**
     * Any user (including guests) may browse internship listings.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Any user (including guests) may view a single internship.
     */
    public function view(?User $user, Internship $internship): bool
    {
        return true;
    }

    /**
     * Only authenticated users with the 'company' role can create internships.
     */
    public function create(User $user): bool
    {
        return $user->role === 'company';
    }

    /**
     * A company may only update its OWN internships.
     *
     * We use the null-safe operator on `$user->company` because a company
     * user is guaranteed to have a company profile (created on registration),
     * but being defensive prevents a 500 if data is somehow inconsistent.
     */
    public function update(User $user, Internship $internship): bool
    {
        return $user->role === 'company'
            && $user->company?->id === $internship->company_id;
    }

    /**
     * A company may only delete its OWN internships.
     */
    public function delete(User $user, Internship $internship): bool
    {
        return $user->role === 'company'
            && $user->company?->id === $internship->company_id;
    }

    /**
     * A company may view applications only for internships it owns.
     */
    public function viewApplications(User $user, Internship $internship): bool
    {
        return $user->role === 'company'
            && $user->company?->id === $internship->company_id;
    }
}
