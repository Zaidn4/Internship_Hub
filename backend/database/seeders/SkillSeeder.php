<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    /**
     * A curated list of tech and business skills covering the most common
     * internship requirements. Sorted alphabetically for consistency.
     * Uses firstOrCreate so the seeder is safe to run multiple times.
     */
    public function run(): void
    {
        $skills = [
            'Docker',
            'Express.js',
            'Figma',
            'Laravel',
            'MySQL',
            'Node.js',
            'PostgreSQL',
            'Product Management',
            'Python',
            'React',
            'Scrum',
            'Tailwind CSS',
            'TypeScript',
            'UX Design',
            'Vue.js',
        ];

        foreach ($skills as $name) {
            Skill::firstOrCreate(['name' => $name]);
        }

        $this->command->info('✓ Seeded ' . count($skills) . ' skills.');
    }
}
