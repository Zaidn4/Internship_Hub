<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * Default state — generic user (role not set here; callers set it via state).
     */
    public function definition(): array
    {
        return [
            'name'               => fake()->name(),
            'email'              => fake()->unique()->safeEmail(),
            'email_verified_at'  => now(),
            'password'           => static::$password ??= Hash::make('password'),
            'remember_token'     => Str::random(10),
            'role'               => 'student',
        ];
    }

    // ── States ────────────────────────────────────────────────────────────────

    /**
     * Configure the user as a student (default role).
     */
    public function student(): static
    {
        return $this->state(fn () => ['role' => 'student']);
    }

    /**
     * Configure the user as a company recruiter.
     * Also creates the associated Company profile automatically.
     */
    public function company(): static
    {
        return $this
            ->state(fn () => ['role' => 'company'])
            ->afterCreating(function (User $user) {
                $techCompanies = [
                    ['name' => 'Apex Labs',        'website' => 'https://apexlabs.io'],
                    ['name' => 'Nexora Tech',       'website' => 'https://nexora.tech'],
                    ['name' => 'Prism Digital',     'website' => 'https://prismdigital.co'],
                    ['name' => 'CodeBridge',        'website' => 'https://codebridge.dev'],
                    ['name' => 'Orbit Systems',     'website' => 'https://orbitsystems.io'],
                    ['name' => 'Blueshift AI',      'website' => 'https://blueshiftai.com'],
                    ['name' => 'DataForge',         'website' => 'https://dataforge.io'],
                    ['name' => 'Quantum Leap Tech', 'website' => 'https://qltech.io'],
                    ['name' => 'Skyline Software',  'website' => 'https://skylinesoftware.dev'],
                    ['name' => 'Vortex Cloud',      'website' => 'https://vortexcloud.io'],
                    ['name' => 'PulseApp',          'website' => 'https://pulseapp.co'],
                    ['name' => 'GridIron Labs',     'website' => 'https://gridiron.dev'],
                ];

                $pick = fake()->unique(reset: true)->randomElement($techCompanies);

                $descriptions = [
                    'We build cutting-edge developer tools and cloud infrastructure with a strong open-source culture.',
                    'A product studio focused on designing and shipping scalable SaaS applications for modern businesses.',
                    'AI-first company transforming industries through machine learning pipelines and intelligent automation.',
                    'Full-stack engineering consultancy helping startups go from idea to production in weeks, not months.',
                    'Fintech startup revolutionising payments and financial analytics across emerging markets.',
                    'Remote-first team of engineers building the next generation of collaboration and productivity tools.',
                    'DevOps and cloud-native specialists enabling engineering teams to ship faster with confidence.',
                    'Data engineering company turning raw data lakes into actionable business intelligence at scale.',
                ];

                Company::create([
                    'user_id'      => $user->id,
                    'company_name' => $pick['name'],
                    'description'  => fake()->randomElement($descriptions),
                    'website'      => $pick['website'],
                ]);
            });
    }

    /**
     * Mark the user's email as unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
