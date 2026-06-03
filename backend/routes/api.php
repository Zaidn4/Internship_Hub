<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\SavedInternshipController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes here are prefixed with /api automatically by Laravel.
| Stateless authentication is handled via Laravel Sanctum bearer tokens.
|
*/

// ── Public Auth Routes ──────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Password Reset (public — no Sanctum token required) ─────────────────────

/**
 * POST /api/forgot-password
 * Accepts: { email }
 * Sends a reset link to the given email (written to laravel.log via MAIL_MAILER=log).
 */
Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => ['required', 'email']]);

    $status = Password::sendResetLink($request->only('email'));

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json(['message' => __($status)], 200);
    }

    // User not found or throttled — return 422 so frontend can display feedback
    throw ValidationException::withMessages([
        'email' => [__($status)],
    ]);
})->name('password.email');

/**
 * POST /api/reset-password
 * Accepts: { token, email, password, password_confirmation }
 * Validates the token and updates the user's password.
 */
Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token'                 => ['required'],
        'email'                 => ['required', 'email'],
        'password'              => ['required', 'confirmed', 'min:8'],
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill(['password' => Hash::make($password)])->save();
            // Revoke all existing Sanctum tokens so old sessions are invalidated
            $user->tokens()->delete();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json(['message' => __($status)], 200);
    }

    throw ValidationException::withMessages([
        'email' => [__($status)],
    ]);
})->name('password.reset');

// ── Public Internship Routes (no token required) ─────────────────────────────
// Guests may browse and view internship listings
Route::apiResource('internships', InternshipController::class)
    ->only(['index', 'show']);

// ── Public Skills Route (no token required) ──────────────────────────────────
// Skill list is non-sensitive; making it public avoids auth race conditions
Route::get('/skills', [SkillController::class, 'index']);

// ── Protected Routes (requires valid Sanctum token) ─────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth context ─────────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    // ── User account ─────────────────────────────────────────────────────────
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::post('/user/avatar',  [UserController::class, 'updateAvatar']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Shared routes (Comments)
    Route::get('/internships/{id}/comments', [CommentController::class, 'index']);
    Route::post('/internships/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // ── Dashboard statistics ──────────────────────────────────────────────────
    Route::get('/company/dashboard', [DashboardController::class, 'companyStats']);
    Route::get('/student/dashboard', [DashboardController::class, 'studentStats']);

    // ── Company profile ───────────────────────────────────────────────────────
    Route::get('/company/profile', [CompanyProfileController::class, 'getProfile']);
    Route::put('/company/profile', [CompanyProfileController::class, 'updateProfile']);

    // ── Internship management (role + ownership via InternshipPolicy) ─────────
    Route::apiResource('internships', InternshipController::class)
        ->only(['store', 'update', 'destroy']);

    // ── Application routes ───────────────────────────────────────────────────

    // Student: submit an application to an internship
    Route::post('/internships/{internship}/apply', [ApplicationController::class, 'apply']);

    // Company: view all applications for one of their internships
    Route::get('/internships/{internship}/applications', [ApplicationController::class, 'getCompanyApplications']);

    // Company: accept or reject a specific application
    Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);

    // Student: list all applications they have submitted
    Route::get('/student/applications', [ApplicationController::class, 'getStudentApplications']);

    // Student: update their own profile (POST for multipart/form-data file upload compatibility)
    Route::post('/student/profile', [StudentProfileController::class, 'update']);

    // Student: sync selected skills to the pivot table (plain JSON, separate from multipart profile)
    Route::put('/student/skills', [StudentProfileController::class, 'syncSkills']);


    // ── Saved Internships ────────────────────────────────────────────────────
    Route::get('/student/saved-internships',     [SavedInternshipController::class, 'index']);
    Route::get('/student/saved-internship-ids',  [SavedInternshipController::class, 'savedIds']);
    Route::post('/student/internships/{id}/save', [SavedInternshipController::class, 'toggle']);

    // ── Community Feed ───────────────────────────────────────────────────────
    Route::get('/feed',                                  [FeedController::class, 'index']);
    Route::post('/feed/posts',                           [FeedController::class, 'storePost']);
    Route::put('/feed/posts/{post}',                     [FeedController::class, 'updatePost']);
    Route::delete('/feed/posts/{post}',                  [FeedController::class, 'destroyPost']);
    Route::post('/feed/posts/{post}/like',               [FeedController::class, 'toggleLike']);
    Route::post('/feed/posts/{post}/comments',           [FeedController::class, 'storeComment']);
    Route::delete('/feed/comments/{comment}',            [FeedController::class, 'destroyComment']);
});
