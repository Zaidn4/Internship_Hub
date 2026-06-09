<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Internship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Internship>
 */
class InternshipFactory extends Factory
{
    protected $model = Internship::class;

    public function definition(): array
    {
        $roles = [
            'Frontend Developer Intern',
            'Backend Developer Intern',
            'Full Stack Engineer Intern',
            'Data Science Intern',
            'Machine Learning Intern',
            'DevOps Engineer Intern',
            'Cloud Infrastructure Intern',
            'Mobile Developer Intern (React Native)',
            'iOS Developer Intern',
            'Android Developer Intern',
            'Site Reliability Engineering Intern',
            'Security Engineering Intern',
            'Product Manager Intern',
            'UX/UI Design Intern',
            'Data Engineering Intern',
            'Backend Python Intern',
            'QA Automation Engineer Intern',
            'Platform Engineering Intern',
            'Software Engineer Intern',
            'Growth Engineering Intern',
        ];

        $locations = [
            'London, UK',
            'Berlin, Germany',
            'Amsterdam, Netherlands',
            'Paris, France',
            'New York, USA',
            'San Francisco, USA',
            'Toronto, Canada',
            'Singapore',
            'Remote',
            'Remote (Europe)',
            'Remote (Worldwide)',
            'Dublin, Ireland',
            'Stockholm, Sweden',
            'Lisbon, Portugal',
            'Barcelona, Spain',
        ];

        $types = ['remote', 'on-site', 'hybrid'];

        $descriptionTemplates = [
            "Join our engineering team and contribute to {PRODUCT}. You'll work closely with senior engineers on {TASK}, and get hands-on experience with {TECH}. We value curiosity, clean code, and fast iteration.",
            "We're looking for a motivated intern to help us {TASK}. You'll be working on {PRODUCT} alongside a cross-functional team. Familiarity with {TECH} is a big plus.",
            "As a {ROLE} intern you will {TASK}. You'll gain real-world experience building {PRODUCT} in a collaborative environment. Strong fundamentals and a passion for {TECH} are what we look for.",
            "This internship is a rare opportunity to work on {PRODUCT} from day one. Your responsibilities will include {TASK}, and you'll sharpen your skills in {TECH} throughout the programme.",
            "Help us shape the future of {PRODUCT}. You will {TASK}, collaborate with product and design, and leave with deep practical knowledge of {TECH}.",
        ];

        $products = [
            'our customer-facing dashboard',
            'an internal developer platform',
            'our core API infrastructure',
            'a real-time analytics pipeline',
            'a multi-tenant SaaS platform',
            'our mobile app used by 100k+ users',
            'a data lake and BI tooling layer',
            'our microservices architecture',
            'an AI-powered recommendation engine',
        ];

        $tasks = [
            'build and maintain RESTful APIs',
            'design and implement reusable UI components',
            'improve CI/CD pipelines and deployment workflows',
            'write automated tests and improve code coverage',
            'optimise database queries and schema design',
            'develop and deploy machine learning models',
            'integrate third-party APIs and webhooks',
            'build internal tooling to reduce manual ops work',
            'contribute to our open-source libraries',
            'conduct user research and translate insights into features',
        ];

        $techStacks = [
            'React and TypeScript',
            'Python and FastAPI',
            'Node.js and PostgreSQL',
            'Docker and Kubernetes',
            'Laravel and MySQL',
            'Go and gRPC',
            'PyTorch and HuggingFace',
            'Terraform and AWS',
            'Flutter and Dart',
            'GraphQL and Apollo',
        ];

        $role = fake()->randomElement($roles);
        $template = fake()->randomElement($descriptionTemplates);

        $description = str_replace(
            ['{PRODUCT}', '{TASK}', '{TECH}', '{ROLE}'],
            [
                fake()->randomElement($products),
                fake()->randomElement($tasks),
                fake()->randomElement($techStacks),
                $role,
            ],
            $template
        );

        return [
            'company_id'  => Company::inRandomOrder()->first()?->id ?? Company::factory(),
            'title'       => $role,
            'description' => $description,
            'location'    => fake()->randomElement($locations),
            'type'        => fake()->randomElement($types),
            'deadline'    => fake()->dateTimeBetween('+2 weeks', '+6 months')->format('Y-m-d'),
            'salary'      => fake()->randomElement([800, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2200, 2500]),
        ];
    }
}
