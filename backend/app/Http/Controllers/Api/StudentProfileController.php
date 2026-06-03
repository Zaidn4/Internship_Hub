<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentProfileController extends Controller
{
    /**
     * Update the authenticated student's profile.
     *
     * Accepts a multipart/form-data POST body to support file uploads alongside
     * text fields. PHP does not parse multipart data on PUT/PATCH requests, so
     * POST is the correct HTTP verb here.
     *
     * Fields (all optional/nullable):
     *   university  string, max:255
     *   bio         string, max:2000
     *   cv          file,   pdf only, max 2 MB
     *
     * On success, returns the updated profile fields so the client can refresh
     * its local state without an extra GET /user call.
     */
    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students may update a student profile.'], 403);
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        // ── Validation ────────────────────────────────────────────────────────
        // 'sometimes' = only run the rule if the field is present in the request.
        // Without it, an absent 'cv' field still triggers the 'file' rule
        // because Laravel treats absent-but-nullable as present-but-null,
        // and an empty-string submission still fails the 'file' check.
        $validated = $request->validate([
            'university'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio'           => ['sometimes', 'nullable', 'string', 'max:2000'],
            'cv'            => ['sometimes', 'nullable', 'file', 'mimes:pdf', 'max:2048'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:30'],
            'linkedin_link' => ['sometimes', 'nullable', 'url', 'max:255'],
            'github_link'   => ['sometimes', 'nullable', 'url', 'max:255'],
            'languages'     => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        // ── Handle CV upload ──────────────────────────────────────────────────
        if ($request->hasFile('cv')) {
            // Delete old CV to prevent orphaned files accumulating in storage
            if ($profile->cv_path && Storage::disk('public')->exists($profile->cv_path)) {
                Storage::disk('public')->delete($profile->cv_path);
            }

            // Store the new file under storage/app/public/cvs/
            // Returns a relative path like "cvs/abc123.pdf"
            $validated['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        // Remove the 'cv' key (it was the uploaded file object, not a DB column)
        unset($validated['cv']);


        // ── Persist only the fields that were present in the request ─────────
        // We use array_key_exists (not isset / truthy check) so that a student
        // can explicitly clear a field by sending an empty string — which is a
        // valid update. array_filter would incorrectly discard '' values.
        $updateData = [];
        foreach (['university', 'bio', 'cv_path', 'phone', 'linkedin_link', 'github_link', 'languages'] as $field) {
            if (array_key_exists($field, $validated)) {
                $updateData[$field] = $validated[$field];
            }
        }

        if (! empty($updateData)) {
            $profile->update($updateData);
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => [
                'id'            => $profile->id,
                'university'    => $profile->university,
                'bio'           => $profile->bio,
                'cv_path'       => $profile->cv_path,
                'phone'         => $profile->phone,
                'linkedin_link' => $profile->linkedin_link,
                'github_link'   => $profile->github_link,
                'languages'     => $profile->languages,
            ],
        ]);
    }

    /**
     * Sync the authenticated student's selected skills.
     *
     * Accepts a plain JSON body: { "skills": [1, 3, 7] }
     * Uses Eloquent sync() so removed skills are detached and new ones
     * are attached in one atomic operation — no manual diff required.
     *
     * Kept separate from update() because mixing a JSON array into
     * multipart/form-data (required for the CV file upload) is fragile.
     */
    public function syncSkills(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students may update skills.'], 403);
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $validated = $request->validate([
            'skills'   => ['present', 'array'],
            'skills.*' => ['integer', 'exists:skills,id'],
        ]);

        $profile->skills()->sync($validated['skills']);

        // Return the fresh, ordered skill list so the frontend can update
        // local state without firing an extra GET /user round-trip.
        $skills = $profile->skills()->orderBy('name')->get(['skills.id', 'name']);

        return response()->json([
            'message' => 'Skills updated successfully.',
            'skills'  => $skills,
        ]);
    }
}
