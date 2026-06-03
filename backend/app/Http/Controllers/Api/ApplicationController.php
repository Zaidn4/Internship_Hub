<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    // -------------------------------------------------------------------------
    // Student Endpoints
    // -------------------------------------------------------------------------

    /**
     * Apply to an internship.
     *
     * Guard: student role only.
     * Duplicate protection: explicit exists() check returns a clear 409 before
     * hitting the DB unique constraint — giving the client an actionable message.
     * CV snapshot: copies cv_path from the student's profile at apply-time so
     * the application record preserves the exact CV submitted, even if the
     * student updates their CV later.
     */
    public function apply(Request $request, Internship $internship): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students may apply to internships.'], 403);
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        // ── Duplicate application guard ──────────────────────────────────────
        $alreadyApplied = Application::where('internship_id', $internship->id)
            ->where('student_id', $profile->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'You have already applied to this internship.',
            ], 409);
        }

        // ── Create application with CV snapshot ──────────────────────────────
        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id'    => $profile->id,
            'status'        => 'pending',
            'cv_path'       => $profile->cv_path,  // immutable snapshot
        ]);

        $application->load('internship');

        return response()->json([
            'message'     => 'Application submitted successfully.',
            'application' => new ApplicationResource($application),
        ], 201);
    }

    /**
     * List all applications for the authenticated student.
     *
     * Guard: student role only (structural self-ownership — no policy needed
     * because the query is scoped to $profile->id).
     * Eager-loads internship → company so the student can see who they applied to.
     */
    public function getStudentApplications(Request $request): JsonResponse|AnonymousResourceCollection
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students may access this endpoint.'], 403);
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $applications = $profile->applications()
            ->with(['internship.company.user'])
            ->latest()
            ->get();

        return ApplicationResource::collection($applications);
    }

    // -------------------------------------------------------------------------
    // Company Endpoints
    // -------------------------------------------------------------------------

    /**
     * List all applications for a specific internship.
     *
     * Guard: ApplicationPolicy@viewApplications — only the company that owns
     * this internship may view its applicant list.
     * Eager-loads student → user so the company sees the applicant's name, email,
     * university, and bio in a single query.
     */
    public function getCompanyApplications(Request $request, Internship $internship): JsonResponse|AnonymousResourceCollection
    {
        $this->authorize('viewApplications', $internship);

        $applications = $internship->applications()
            ->with(['student.user'])
            ->latest()
            ->get();

        return ApplicationResource::collection($applications);
    }

    /**
     * Accept or reject an application.
     *
     * Guard: ApplicationPolicy@updateStatus — company must own the internship
     * this application belongs to.
     * 'pending' is intentionally excluded from the valid statuses: companies
     * cannot reset a decision once made.
     */
    public function updateStatus(Request $request, Application $application): JsonResponse
    {
        // Eager-load internship before calling authorize() so the policy
        // doesn't trigger a lazy-load (and a duplicate query).
        $application->load('internship');

        $this->authorize('updateStatus', $application);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:accepted,rejected'],
        ]);

        $application->update(['status' => $validated['status']]);

        return response()->json([
            'message'     => "Application {$validated['status']}.",
            'application' => new ApplicationResource($application),
        ]);
    }
}
