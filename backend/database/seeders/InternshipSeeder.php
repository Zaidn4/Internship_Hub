<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Internship;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class InternshipSeeder extends Seeder
{
    /**
     * Creates 18 diverse internship listings across all 4 seeded companies.
     * Each listing gets 2–5 relevant skills attached via the pivot table.
     */
    public function run(): void
    {
        // Load companies by email so we don't hard-code IDs
        $techwave  = Company::whereHas('user', fn ($q) => $q->where('email', 'alice@techwave.io'))->firstOrFail();
        $stackforge = Company::whereHas('user', fn ($q) => $q->where('email', 'marcus@stackforge.dev'))->firstOrFail();
        $designhub  = Company::whereHas('user', fn ($q) => $q->where('email', 'priya@designhub.co'))->firstOrFail();
        $cloudnine  = Company::whereHas('user', fn ($q) => $q->where('email', 'james@cloudnine.io'))->firstOrFail();

        // Helper to resolve skill IDs by name
        $skill = fn (array $names) => Skill::whereIn('name', $names)->pluck('id')->toArray();

        $listings = [
            // ── TechWave Labs ──────────────────────────────────────────────────
            [
                'company_id'  => $techwave->id,
                'title'       => 'Backend Developer Intern',
                'description' => 'Join our core platform team to build and maintain RESTful APIs, improve database performance, and write clean, tested PHP code. You\'ll work directly with senior engineers on production systems.',
                'location'    => 'London, UK',
                'type'        => 'hybrid',
                'deadline'    => now()->addDays(60)->toDateString(),
                'salary'      => 1800.00,
                'skills'      => $skill(['Laravel', 'MySQL', 'Docker']),
            ],
            [
                'company_id'  => $techwave->id,
                'title'       => 'Frontend React Engineer Intern',
                'description' => 'Help us rebuild our customer-facing dashboard using React and TypeScript. You\'ll be involved in component architecture decisions, design system work, and performance optimisation.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(45)->toDateString(),
                'salary'      => 1600.00,
                'skills'      => $skill(['React', 'TypeScript', 'Tailwind CSS']),
            ],
            [
                'company_id'  => $techwave->id,
                'title'       => 'DevOps Intern',
                'description' => 'Assist with our CI/CD pipelines, container orchestration, and cloud infrastructure on AWS. Get hands-on experience with Kubernetes, Terraform, and monitoring stacks.',
                'location'    => 'London, UK',
                'type'        => 'on-site',
                'deadline'    => now()->addDays(90)->toDateString(),
                'salary'      => 1900.00,
                'skills'      => $skill(['Docker', 'PostgreSQL', 'Scrum']),
            ],
            [
                'company_id'  => $techwave->id,
                'title'       => 'Python Data Engineer Intern',
                'description' => 'Work with our data team to build ETL pipelines, maintain data warehouses, and write analytical queries. Experience with pandas, SQLAlchemy, or dbt is a bonus.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(75)->toDateString(),
                'salary'      => 1700.00,
                'skills'      => $skill(['Python', 'PostgreSQL', 'MySQL']),
            ],

            // ── StackForge ─────────────────────────────────────────────────────
            [
                'company_id'  => $stackforge->id,
                'title'       => 'Full-Stack Node.js Intern',
                'description' => 'Build features end-to-end for our SaaS clients. You\'ll work across Express.js APIs and React frontends, writing tests and shipping to production weekly.',
                'location'    => 'Manchester, UK',
                'type'        => 'hybrid',
                'deadline'    => now()->addDays(50)->toDateString(),
                'salary'      => 1500.00,
                'skills'      => $skill(['Node.js', 'Express.js', 'React', 'MySQL']),
            ],
            [
                'company_id'  => $stackforge->id,
                'title'       => 'Vue.js Frontend Intern',
                'description' => 'Develop new product features in our Vue 3 + Pinia codebase. Strong CSS skills and an eye for pixel-perfect UI are important. Tailwind experience preferred.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(40)->toDateString(),
                'salary'      => 1400.00,
                'skills'      => $skill(['Vue.js', 'TypeScript', 'Tailwind CSS']),
            ],
            [
                'company_id'  => $stackforge->id,
                'title'       => 'Product Management Intern',
                'description' => 'Partner with our PMs to run discovery sprints, write user stories, and track metrics. You\'ll own small product initiatives from discovery through to launch.',
                'location'    => 'Manchester, UK',
                'type'        => 'on-site',
                'deadline'    => now()->addDays(30)->toDateString(),
                'salary'      => 1300.00,
                'skills'      => $skill(['Product Management', 'Scrum', 'Figma']),
            ],
            [
                'company_id'  => $stackforge->id,
                'title'       => 'TypeScript API Intern',
                'description' => 'Help us migrate our REST API from JavaScript to fully-typed TypeScript. You\'ll improve our OpenAPI specs, add Zod validation schemas, and write integration tests.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(80)->toDateString(),
                'salary'      => 1600.00,
                'skills'      => $skill(['TypeScript', 'Node.js', 'Express.js', 'PostgreSQL']),
            ],
            [
                'company_id'  => $stackforge->id,
                'title'       => 'Scrum Master Intern',
                'description' => 'Shadow our Scrum Masters across two delivery squads. You\'ll facilitate stand-ups, retros, and sprint reviews while helping teams improve their agile practices.',
                'location'    => 'Manchester, UK',
                'type'        => 'on-site',
                'deadline'    => now()->addDays(120)->toDateString(),
                'salary'      => 1200.00,
                'skills'      => $skill(['Scrum', 'Product Management']),
            ],

            // ── DesignHub Co. ──────────────────────────────────────────────────
            [
                'company_id'  => $designhub->id,
                'title'       => 'UX Design Intern',
                'description' => 'Join our design studio to conduct user research, create wireframes and prototypes in Figma, and collaborate with engineering teams to ship polished product experiences.',
                'location'    => 'Bristol, UK',
                'type'        => 'hybrid',
                'deadline'    => now()->addDays(55)->toDateString(),
                'salary'      => 1400.00,
                'skills'      => $skill(['UX Design', 'Figma']),
            ],
            [
                'company_id'  => $designhub->id,
                'title'       => 'Design Systems Intern',
                'description' => 'Help build and maintain our Figma component library and its React/Tailwind CSS implementation. Bridge the gap between design and engineering.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(65)->toDateString(),
                'salary'      => 1350.00,
                'skills'      => $skill(['Figma', 'React', 'Tailwind CSS', 'UX Design']),
            ],
            [
                'company_id'  => $designhub->id,
                'title'       => 'Product Design Intern',
                'description' => 'Own the design of new product features from concept to handoff. You\'ll work closely with PMs and engineers, running usability tests and iterating rapidly based on feedback.',
                'location'    => 'Bristol, UK',
                'type'        => 'on-site',
                'deadline'    => now()->addDays(35)->toDateString(),
                'salary'      => 1450.00,
                'skills'      => $skill(['Figma', 'UX Design', 'Product Management']),
            ],
            [
                'company_id'  => $designhub->id,
                'title'       => 'Frontend Engineer Intern (Design Focus)',
                'description' => 'Implement our design system components in React + Tailwind. You have an eye for design and enjoy the craft of building pixel-perfect, accessible UI.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(100)->toDateString(),
                'salary'      => 1500.00,
                'skills'      => $skill(['React', 'TypeScript', 'Tailwind CSS', 'Figma']),
            ],

            // ── CloudNine Solutions ────────────────────────────────────────────
            [
                'company_id'  => $cloudnine->id,
                'title'       => 'Cloud Infrastructure Intern',
                'description' => 'Assist with provisioning and managing cloud resources on AWS and GCP using Terraform and Ansible. Learn about VPC design, IAM policies, and cost optimisation.',
                'location'    => 'Edinburgh, UK',
                'type'        => 'hybrid',
                'deadline'    => now()->addDays(70)->toDateString(),
                'salary'      => 2000.00,
                'skills'      => $skill(['Docker', 'PostgreSQL', 'Python']),
            ],
            [
                'company_id'  => $cloudnine->id,
                'title'       => 'Backend Python Intern',
                'description' => 'Build automation scripts, internal tooling, and lightweight APIs using FastAPI and Python. Help improve our client onboarding pipeline and reduce manual ops work.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(85)->toDateString(),
                'salary'      => 1750.00,
                'skills'      => $skill(['Python', 'Docker', 'PostgreSQL', 'Express.js']),
            ],
            [
                'company_id'  => $cloudnine->id,
                'title'       => 'Site Reliability Engineering Intern',
                'description' => 'Join our SRE team to work on monitoring, alerting, and incident response tooling. Get hands-on experience with Prometheus, Grafana, and PagerDuty integrations.',
                'location'    => 'Edinburgh, UK',
                'type'        => 'on-site',
                'deadline'    => now()->addDays(110)->toDateString(),
                'salary'      => 2200.00,
                'skills'      => $skill(['Docker', 'Python', 'Scrum']),
            ],
            [
                'company_id'  => $cloudnine->id,
                'title'       => 'Database Engineering Intern',
                'description' => 'Work with our data platform team on query optimisation, schema design, and database reliability across MySQL and PostgreSQL clusters. Replication, backups, and monitoring included.',
                'location'    => 'Remote',
                'type'        => 'remote',
                'deadline'    => now()->addDays(95)->toDateString(),
                'salary'      => 1850.00,
                'skills'      => $skill(['MySQL', 'PostgreSQL', 'Python']),
            ],
            [
                'company_id'  => $cloudnine->id,
                'title'       => 'Node.js Backend Intern',
                'description' => 'Build microservices in Node.js/TypeScript that power our client-facing dashboards. Work with message queues, REST APIs, and event-driven architectures.',
                'location'    => 'Edinburgh, UK',
                'type'        => 'hybrid',
                'deadline'    => now()->addDays(50)->toDateString(),
                'salary'      => 1650.00,
                'skills'      => $skill(['Node.js', 'TypeScript', 'Docker', 'PostgreSQL']),
            ],
        ];

        foreach ($listings as $data) {
            $skillIds = $data['skills'];
            unset($data['skills']);

            $internship = Internship::create($data);
            $internship->skills()->sync($skillIds);
        }

        $this->command->info('✓ Seeded ' . count($listings) . ' internships with skills.');
    }
}
