<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Relations (company, skills) are included only when they have been
     * eager-loaded, preventing accidental N+1 queries on list endpoints.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'location'    => $this->location,
            'type'        => $this->type,
            'deadline'    => $this->deadline?->toDateString(),
            'salary'      => $this->salary,
            'company'     => $this->whenLoaded('company', fn () => [
                'id'           => $this->company->id,
                'company_name' => $this->company->company_name,
                'website'      => $this->company->website,
                'avatar_url'   => $this->company->relationLoaded('user')
                                    ? $this->company->user?->avatar_url
                                    : null,
            ]),
            'skills'      => $this->whenLoaded('skills', fn () =>
                $this->skills->map(fn ($skill) => [
                    'id'   => $skill->id,
                    'name' => $skill->name,
                ])
            ),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
