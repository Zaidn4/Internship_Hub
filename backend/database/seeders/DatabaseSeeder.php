<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Order matters — Skills must exist before Internships try to attach them,
     * and Companies must exist before Internships are created.
     */
    public function run(): void
    {
        $this->call([
            SkillSeeder::class,
            CompanySeeder::class,
            InternshipSeeder::class,
        ]);
    }
}
