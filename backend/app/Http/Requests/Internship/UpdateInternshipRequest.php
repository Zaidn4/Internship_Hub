<?php

namespace App\Http\Requests\Internship;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternshipRequest extends FormRequest
{
    /**
     * Authorization is handled by InternshipPolicy@update, which verifies
     * that the authenticated user's company owns this internship.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('internship')) ?? false;
    }

    /**
     * All fields are 'sometimes' to support partial updates (PATCH semantics).
     * A field is only validated if it is present in the request body.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'location'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'type'        => ['sometimes', 'required', 'string', 'in:remote,on-site,hybrid'],
            'deadline'    => ['sometimes', 'required', 'date', 'after:today'],
            'salary'      => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'skills'      => ['sometimes', 'nullable', 'array'],
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
