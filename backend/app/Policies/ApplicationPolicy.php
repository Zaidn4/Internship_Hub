<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\Internship;
use App\Models\User;

class ApplicationPolicy
{

    /**
     * A company may update the status of an application only if the application
     * belongs to an internship that their company posted.
     *
     * We load $application->internship lazily here; the controller eager-loads
     * it before calling authorize() to avoid an extra query.
     */
    public function updateStatus(User $user, Application $application): bool
    {
        return $user->isCompany()
            && $user->company?->id === $application->internship?->company_id;
    }
}
