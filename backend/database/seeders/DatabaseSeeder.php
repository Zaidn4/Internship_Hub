<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\FeedComment;
use App\Models\Internship;
use App\Models\Post;
use App\Models\Skill;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Execution order:
     *   1. Skills            — referenced by internship_skill pivot
     *   2. Test accounts     — deterministic logins for demos
     *   3. Company users     — creates Company profiles via factory afterCreating
     *   4. Student users     — creates StudentProfile rows
     *   5. Internships       — require companies to exist first
     *   6. Posts             — polymorphic authors (students + companies)
     *   7. Feed comments     — require posts to exist first
     */
    public function run(): void
    {
        // ── 1. Skills ─────────────────────────────────────────────────────────
        $this->call(SkillSeeder::class);
        $this->command->info('✓ Skills seeded.');

        $skills = Skill::all();

        // ── 2. Test accounts ──────────────────────────────────────────────────

        // Student test account
        $studentUser = User::factory()->student()->create([
            'name'     => 'Test Student',
            'email'    => 'student@test.com',
            'password' => Hash::make('password'),
        ]);
        StudentProfile::factory()->create(['user_id' => $studentUser->id]);

        // Company test account
        $companyUser = User::factory()->create([
            'name'     => 'Test Company',
            'email'    => 'company@test.com',
            'password' => Hash::make('password'),
            'role'     => 'company',
        ]);
        Company::create([
            'user_id'      => $companyUser->id,
            'company_name' => 'InternshipHub Demo Co.',
            'description'  => 'This is the demo company account used for platform testing and walkthroughs.',
            'website'      => 'https://internshiphub.demo',
        ]);

        $this->command->info('✓ Test accounts created (student@test.com / company@test.com).');

        // ── 3. Company users (10 random companies) ────────────────────────────
        User::factory(10)->company()->create();
        $this->command->info('✓ 10 companies generated.');

        // ── 4. Student users (20 random students) ─────────────────────────────
        $studentUsers = User::factory(20)->student()->create();

        foreach ($studentUsers as $user) {
            StudentProfile::factory()->create(['user_id' => $user->id]);
        }
        $this->command->info('✓ 20 students generated.');

        // ── 5. Internships (30 listings assigned to random companies) ─────────
        $companies = Company::all();

        Internship::factory(30)->make()->each(function (Internship $internship) use ($companies, $skills) {
            $internship->company_id = $companies->random()->id;
            $internship->save();

            // Attach 2–4 random skills to each internship
            $internship->skills()->sync(
                $skills->random(rand(2, 4))->pluck('id')->toArray()
            );
        });
        $this->command->info('✓ 30 internships generated with skills.');

        // ── 6. Feed Posts (40 posts, polymorphic authors) ─────────────────────
        // Factories pick random StudentProfile or Company as author.
        // We reload students/companies after creation to ensure all exist.
        Post::factory(40)->create();
        $this->command->info('✓ 40 feed posts generated.');

        // ── 7. Feed Comments (100 comments on random posts) ───────────────────
        FeedComment::factory(100)->create();
        $this->command->info('✓ 100 feed comments generated.');

        $this->command->newLine();
        $this->command->info('🌱 Database seeded successfully!');
        $this->command->table(
            ['Resource', 'Count'],
            [
                ['Skills',          Skill::count()],
                ['Users',           User::count()],
                ['Companies',       Company::count()],
                ['Student Profiles', StudentProfile::count()],
                ['Internships',     Internship::count()],
                ['Feed Posts',      Post::count()],
                ['Feed Comments',   FeedComment::count()],
            ]
        );
    }
}
