<?php

namespace App\Http\Requests\Internship;

use App\Models\Internship;
use Illuminate\Foundation\Http\FormRequest;

class StoreInternshipRequest extends FormRequest
{
    /**
     * Only company-role users may create internships.
     * The policy gate is the authoritative check; this is a belt-and-suspenders
     * shortcut that returns false early for non-company users before validation runs.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Internship::class) ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location'    => ['nullable', 'string', 'max:255'],
            'type'        => ['required', 'string', 'in:remote,on-site,hybrid'],
            'deadline'    => ['required', 'date', 'after:today'],
            'salary'      => ['nullable', 'numeric', 'min:0'],
            'skills'      => ['nullable', 'array'],
            'skills.*'    => ['integer', 'exists:skills,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.in'          => 'Type must be one of: remote, on-site, hybrid.',
            'deadline.after'   => 'The deadline must be a future date.',
            'skills.*.exists'  => 'One or more selected skills do not exist.',
        ];
    }
}
