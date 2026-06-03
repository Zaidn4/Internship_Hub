<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CompanySeeder extends Seeder
{
    /**
     * Creates 4 realistic company users with full company profiles.
     * Each password is 'password' for easy dev login.
     */
    public function run(): void
    {
        $companies = [
            [
                'user' => [
                    'name'     => 'Alice Chen',
                    'email'    => 'alice@techwave.io',
                    'password' => Hash::make('password'),
                    'role'     => 'company',
                ],
                'company' => [
                    'company_name' => 'TechWave Labs',
                    'description'  => 'Building the next generation of developer tooling and cloud infrastructure. We love open source and move fast.',
                    'website'      => 'https://techwave.io',
                ],
            ],
            [
                'user' => [
                    'name'     => 'Marcus Hall',
                    'email'    => 'marcus@stackforge.dev',
                    'password' => Hash::make('password'),
                    'role'     => 'company',
                ],
                'company' => [
                    'company_name' => 'StackForge',
                    'description'  => 'Full-stack product studio. We design, build, and scale digital products for startups and enterprises.',
                    'website'      => 'https://stackforge.dev',
                ],
            ],
            [
                'user' => [
                    'name'     => 'Priya Nair',
                    'email'    => 'priya@designhub.co',
                    'password' => Hash::make('password'),
                    'role'     => 'company',
                ],
                'company' => [
                    'company_name' => 'DesignHub Co.',
                    'description'  => 'Award-winning UX/UI studio specialising in SaaS product design, design systems, and user research.',
                    'website'      => 'https://designhub.co',
                ],
            ],
            [
                'user' => [
                    'name'     => 'James Obi',
                    'email'    => 'james@cloudnine.io',
                    'password' => Hash::make('password'),
                    'role'     => 'company',
                ],
                'company' => [
                    'company_name' => 'CloudNine Solutions',
                    'description'  => 'DevOps and cloud consultancy helping engineering teams ship faster with Kubernetes, CI/CD, and observability.',
                    'website'      => 'https://cloudnine.io',
                ],
            ],
        ];

        foreach ($companies as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['user']['email']],
                $data['user']
            );

            Company::firstOrCreate(
                ['user_id' => $user->id],
                $data['company']
            );
        }

        $this->command->info('✓ Seeded 4 companies.');
    }
}
