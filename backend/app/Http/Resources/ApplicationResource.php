<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * The `student` relation includes a nested `user` load so the company
     * view shows the applicant's name and email alongside their profile data.
     *
     * Relations are wrapped in whenLoaded() so the same resource class
     * can safely serve both the company view (full detail) and the student
     * view (internship + company context) without N+1 risk.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'status'     => $this->status,
            'cv_path'    => $this->cv_path,
            'applied_at' => $this->created_at,

            // ── Company view: who applied? ──────────────────────────────────
            'student' => $this->whenLoaded('student', fn () => [
                'id'         => $this->student->id,
                'name'       => $this->student->user?->name,
                'email'      => $this->student->user?->email,
                'avatar_url' => $this->student->user?->avatar_url,
                'university' => $this->student->university,
                'bio'        => $this->student->bio,
            ]),

            // ── Student view: what did I apply to? ─────────────────────────
            'internship' => $this->whenLoaded('internship', fn () => [
                'id'       => $this->internship->id,
                'title'    => $this->internship->title,
                'type'     => $this->internship->type,
                'location' => $this->internship->location,
                'deadline' => $this->internship->deadline?->toDateString(),
                'company'  => $this->internship->relationLoaded('company') ? [
                    'id'           => $this->internship->company->id,
                    'company_name' => $this->internship->company->company_name,
                    'website'      => $this->internship->company->website,
                    'avatar_url'   => $this->internship->company->relationLoaded('user')
                                        ? $this->internship->company->user?->avatar_url
                                        : null,
                ] : null,
            ]),
        ];
    }
}
