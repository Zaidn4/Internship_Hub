<?php

namespace App\Http\Controllers\Api;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/company/dashboard
     * Statistics for the authenticated company user.
     */
    public function companyStats(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        if (!$company) {
            return response()->json([
                'active_listings'       => 0,
                'total_applications'    => 0,
                'hired_count'           => 0,
                'applications_by_status' => [],
                'applications_by_month'  => [],
            ]);
        }

        // All internship IDs belonging to this company
        $internshipIds = Internship::where('company_id', $company->id)->pluck('id');

        // ── Stat counts ──────────────────────────────────────────────────────
        $activeListings    = $internshipIds->count();
        $totalApplications = Application::whereIn('internship_id', $internshipIds)->count();
        $hiredCount        = Application::whereIn('internship_id', $internshipIds)
                                ->where('status', 'accepted')
                                ->count();

        // ── Applications by status ───────────────────────────────────────────
        $byStatus = Application::whereIn('internship_id', $internshipIds)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => ['status' => $row->status, 'count' => $row->count])
            ->values();

        // ── Applications by month (last 6 months) ────────────────────────────
        $byMonth = Application::whereIn('internship_id', $internshipIds)
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%b %Y') as month"),
                DB::raw("DATE_FORMAT(created_at, '%Y%m') as sort_key"),
                DB::raw('count(*) as count')
            )
            ->groupBy('month', 'sort_key')
            ->orderBy('sort_key')
            ->get()
            ->map(fn($row) => ['month' => $row->month, 'count' => $row->count])
            ->values();

        return response()->json([
            'active_listings'        => $activeListings,
            'total_applications'     => $totalApplications,
            'hired_count'            => $hiredCount,
            'applications_by_status' => $byStatus,
            'applications_by_month'  => $byMonth,
        ]);
    }

    /**
     * GET /api/student/dashboard
     * Statistics for the authenticated student user.
     */
    public function studentStats(Request $request): JsonResponse
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return response()->json([
                'total_applications'     => 0,
                'pending_count'          => 0,
                'accepted_count'         => 0,
                'rejected_count'         => 0,
                'applications_by_status' => [],
                'recent_applications'    => [],
            ]);
        }

        $applications = Application::where('student_id', $studentProfile->id)
            ->with(['internship.company'])
            ->latest()
            ->get();

        $total    = $applications->count();
        $pending  = $applications->where('status', 'pending')->count();
        $accepted = $applications->where('status', 'accepted')->count();
        $rejected = $applications->where('status', 'rejected')->count();

        // Status chart data (always include all three slices, even if 0)
        $byStatus = [
            ['status' => 'Pending',  'count' => $pending,  'fill' => '#f59e0b'],
            ['status' => 'Accepted', 'count' => $accepted, 'fill' => '#059669'],
            ['status' => 'Rejected', 'count' => $rejected, 'fill' => '#dc2626'],
        ];

        // 3 most recent
        $recent = $applications->take(3)->map(fn($app) => [
            'id'               => $app->id,
            'internship_title' => $app->internship?->title ?? 'Unknown',
            'company_name'     => $app->internship?->company?->company_name ?? '—',
            'status'           => $app->status,
            'applied_at'       => $app->created_at?->format('j M Y'),
        ])->values();

        return response()->json([
            'total_applications'     => $total,
            'pending_count'          => $pending,
            'accepted_count'         => $accepted,
            'rejected_count'         => $rejected,
            'applications_by_status' => $byStatus,
            'recent_applications'    => $recent,
        ]);
    }
}
