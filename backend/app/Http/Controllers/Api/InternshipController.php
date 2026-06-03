<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Internship\StoreInternshipRequest;
use App\Http\Requests\Internship\UpdateInternshipRequest;
use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InternshipController extends Controller
{
    // -------------------------------------------------------------------------
    // Public Endpoints
    // -------------------------------------------------------------------------

    /**
     * List all internships, paginated.
     *
     * Public endpoint — no authentication required.
     * Eager-loads company and skills to avoid N+1 on the collection.
     */
    public function index(): AnonymousResourceCollection
    {
        $internships = Internship::with(['company.user', 'skills'])
            ->latest()
            ->paginate(9);

        return InternshipResource::collection($internships);
    }

    /**
     * Display a single internship with full detail.
     *
     * Public endpoint — route model binding resolves the Internship automatically.
     */
    public function show(Internship $internship): InternshipResource
    {
        $internship->load(['company.user', 'skills']);

        return new InternshipResource($internship);
    }

    // -------------------------------------------------------------------------
    // Protected Endpoints (auth:sanctum + InternshipPolicy)
    // -------------------------------------------------------------------------

    /**
     * Create a new internship listing.
     *
     * Restricted to company-role users via StoreInternshipRequest::authorize()
     * which delegates to InternshipPolicy@create.
     *
     * The company_id is taken from the authenticated user's company profile —
     * never from the request body — preventing ID spoofing.
     */
    public function store(StoreInternshipRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $company = $user->company;

        $internship = $company->internships()->create([
            'title'       => $request->title,
            'description' => $request->description,
            'location'    => $request->location,
            'type'        => $request->type,
            'deadline'    => $request->deadline,
            'salary'      => $request->salary,
        ]);

        // Sync the many-to-many pivot; empty array is fine on creation
        $internship->skills()->sync($request->input('skills', []));

        $internship->load(['company.user', 'skills']);

        return response()->json([
            'message'    => 'Internship created successfully.',
            'internship' => new InternshipResource($internship),
        ], 201);
    }

    /**
     * Update an existing internship.
     *
     * UpdateInternshipRequest::authorize() delegates to InternshipPolicy@update,
     * which verifies the authenticated company owns this internship.
     * Fields use 'sometimes' rules so partial updates are fully supported.
     */
    public function update(UpdateInternshipRequest $request, Internship $internship): JsonResponse
    {
        $internship->update($request->only([
            'title', 'description', 'location', 'type', 'deadline', 'salary',
        ]));

        // Sync skills only if the 'skills' key was present in the request
        if ($request->has('skills')) {
            $internship->skills()->sync($request->input('skills', []));
        }

        $internship->load(['company.user', 'skills']);

        return response()->json([
            'message'    => 'Internship updated successfully.',
            'internship' => new InternshipResource($internship),
        ]);
    }

    /**
     * Delete an internship listing.
     *
     * Ownership is enforced by InternshipPolicy@delete via $this->authorize().
     * Pivot rows in internship_skill are removed by the FK cascade defined
     * in the migration.
     */
    public function destroy(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('delete', $internship);

        $internship->delete();

        return response()->json([
            'message' => 'Internship deleted successfully.',
        ]);
    }
}
