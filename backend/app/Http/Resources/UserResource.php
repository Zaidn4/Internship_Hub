<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Conditionally includes the user's profile relation based on their role,
     * so API consumers always receive full user context in a single response.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,
            'avatar_url' => $this->avatar
                                ? asset('storage/' . ltrim($this->avatar, 'public/'))
                                : null,
            'profile'    => $this->resolveProfile(),
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Resolve the correct profile relation based on the user's role.
     *
     * @return mixed
     */
    private function resolveProfile(): mixed
    {
        return match ($this->role) {
            'student' => $this->whenLoaded('studentProfile', function () {
                $profile = $this->studentProfile;
                return [
                    'id'         => $profile->id,
                    'university' => $profile->university,
                    'bio'        => $profile->bio,
                    'cv_path'    => $profile->cv_path,
                    // Skills are included when studentProfile.skills is eager-loaded
                    'skills'     => $profile->relationLoaded('skills')
                        ? $profile->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values()
                        : [],
                ];
            }),
            'company' => $this->whenLoaded('company'),
            default   => null,
        };
    }
}
