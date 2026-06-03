<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * PUT /api/user/password
     *
     * Allows any authenticated user (student or company) to change their password.
     * Requires the current password to be correct before accepting a new one.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        // Verify the provided current password against the stored hash
        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * POST /api/user/avatar
     *
     * Accepts a multipart image upload, stores it in public/avatars,
     * and updates the user's avatar column with the disk-relative path.
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete the old avatar file to avoid orphaned files on disk
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Generate a unique filename: avatars/{userId}_{uuid}.{ext}
        $ext      = $request->file('avatar')->getClientOriginalExtension();
        $filename = 'avatars/' . $user->id . '_' . Str::uuid() . '.' . $ext;

        // Store on the public disk (symlinked via php artisan storage:link)
        $request->file('avatar')->storeAs('', $filename, 'public');

        // Use direct assignment + save() to bypass mass-assignment guards entirely
        $user->avatar = $filename;
        $user->save();

        return response()->json([
            'message'    => 'Avatar updated successfully.',
            'avatar_url' => asset('storage/' . $filename),
            'user'       => new UserResource($user),
        ]);
    }
}
