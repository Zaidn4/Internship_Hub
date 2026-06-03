<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SavedInternshipController extends Controller
{
    /**
     * Get all internships saved by the authenticated student.
     */
    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students can view saved internships.'], 403);
        }

        // We eagerly load company.user and skills to ensure the resource has all required data
        $internships = $user->savedInternships()
            ->with(['company.user', 'skills'])
            ->latest()
            ->get();

        return InternshipResource::collection($internships);
    }

    /**
     * Get just the array of saved internship IDs for fast UI lookup.
     */
    public function savedIds(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students can view saved internships.'], 403);
        }

        $ids = $user->savedInternships()->pluck('internships.id');

        return response()->json(['saved_ids' => $ids]);
    }

    /**
     * Toggle the saved status of an internship.
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students can save internships.'], 403);
        }

        $result = $user->savedInternships()->toggle($id);
        
        $isSaved = count($result['attached']) > 0;

        return response()->json([
            'message' => $isSaved ? 'Internship saved.' : 'Internship removed from saved list.',
            'is_saved' => $isSaved,
        ]);
    }
}
