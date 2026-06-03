<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CompanyProfileController extends Controller
{
    /**
     * GET /api/company/profile
     *
     * Returns the authenticated user with their company relation loaded
     * so the frontend `user.profile` shape matches what AuthController returns.
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * PUT /api/company/profile
     *
     * Validates and persists company name, website, and description.
     * Returns the refreshed user so the frontend auth context stays in sync.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => ['sometimes', 'string', 'max:255'],
            'website'      => ['nullable', 'url', 'max:255'],
            'description'  => ['nullable', 'string', 'max:5000'],
        ]);

        $user    = $request->user();
        $company = $user->company;

        if (! $company) {
            return response()->json([
                'message' => 'Company profile not found.',
            ], 404);
        }

        $company->update($validated);

        // Reload so UserResource serialises the fresh values
        $user->load('company');

        return response()->json([
            'message' => 'Company profile updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }
}
