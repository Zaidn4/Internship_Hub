<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;

class SkillController extends Controller
{
    /**
     * Return all skills in alphabetical order.
     *
     * This endpoint is intentionally public (no auth required) so that:
     *   - The student profile page can populate the skill picker on load
     *   - The company internship form can show skills without a token race
     *
     * Only `id` and `name` are returned — nothing sensitive.
     */
    public function index(): JsonResponse
    {
        $skills = Skill::orderBy('name')->get(['id', 'name']);

        return response()->json(['data' => $skills]);
    }
}
