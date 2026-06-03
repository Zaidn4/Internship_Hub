<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // -------------------------------------------------------------------------
    // Public Endpoints
    // -------------------------------------------------------------------------

    /**
     * Register a new user (student or company).
     *
     * Creates the User record and its associated profile in a single transaction
     * to guarantee data consistency — no orphaned users without profiles.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            /** @var User $user */
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
            ]);

            if ($request->role === 'student') {
                StudentProfile::create(['user_id' => $user->id]);
                $user->load('studentProfile');
            } else {
                Company::create([
                    'user_id'      => $user->id,
                    'company_name' => $request->company_name,
                ]);
                $user->load('company');
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Authenticate an existing user and issue a fresh token.
     *
     * Previous tokens are revoked on each login to enforce a single active
     * session per user. Adjust this if multi-device support is needed later.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        // Revoke all previous tokens for a clean session
        $user->tokens()->delete();

        $this->loadProfile($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    // -------------------------------------------------------------------------
    // Protected Endpoints (auth:sanctum middleware)
    // -------------------------------------------------------------------------

    /**
     * Revoke the current access token and log the user out.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Return the currently authenticated user with their profile context.
     */
    public function user(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->loadProfile($user);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Eager-load the correct profile relation based on the user's role.
     *
     * Centralising this logic avoids repetition across login() and user()
     * and makes it trivial to extend when the admin role gains a profile.
     */
    private function loadProfile(User $user): User
    {
        return match ($user->role) {
            // Load skills alongside the student profile so the frontend can
            // pre-populate the SkillPicker without an extra API round-trip.
            'student' => $user->load('studentProfile.skills'),
            'company' => $user->load('company'),
            default   => $user,
        };
    }
}
