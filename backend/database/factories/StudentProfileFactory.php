<?php

namespace Database\Factories;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentProfile>
 */
class StudentProfileFactory extends Factory
{
    protected $model = StudentProfile::class;

    public function definition(): array
    {
        $universities = [
            'Massachusetts Institute of Technology',
            'Stanford University',
            'University of Cambridge',
            'ETH Zurich',
            'University of Oxford',
            'Carnegie Mellon University',
            'Imperial College London',
            'University of Toronto',
            'National University of Singapore',
            'TU Berlin',
            'University of Edinburgh',
            'EPFL Lausanne',
            'Georgia Institute of Technology',
            'University of Melbourne',
            'KU Leuven',
        ];

        $bios = [
            'Final-year Computer Science student passionate about backend systems and distributed computing. Looking for a challenging internship to apply my skills in real-world production environments.',
            'Frontend-focused developer with a love for design systems and accessibility. Experienced with React and TypeScript, seeking a role at a product-driven company.',
            'Data science enthusiast with hands-on experience in Python, pandas, and scikit-learn. Eager to work on ML pipelines and real business problems.',
            'Full-stack developer comfortable across the entire web stack. I enjoy building clean APIs and intuitive UIs, with a focus on developer experience.',
            'DevOps and cloud-curious student with experience in Docker, Linux, and CI/CD pipelines. Looking to contribute to a fast-moving engineering team.',
            'Aspiring software engineer with a background in algorithms and competitive programming. I thrive in problem-solving environments and love clean, tested code.',
            'Mobile developer specialising in React Native and Flutter. Passionate about smooth animations and great UX on iOS and Android.',
            'Cybersecurity student with interests in penetration testing and secure software development. Seeking a role where I can apply security-first thinking.',
            'Machine learning researcher transitioning into industry, with publications in NLP and computer vision. Comfortable with PyTorch and HuggingFace.',
            'Product-minded engineer who enjoys bridging the gap between user needs and technical implementation. Strong in JavaScript and Python.',
        ];

        $languageSets = [
            'JavaScript, Python',
            'Python, Java',
            'TypeScript, Go',
            'C++, Python, Rust',
            'JavaScript, TypeScript, Python',
            'Java, Kotlin',
            'Python, R',
            'Go, Python',
            'PHP, JavaScript',
            'C#, Python',
            'Swift, Objective-C',
            'Dart, JavaScript',
        ];

        $firstName = fake()->firstName();
        $lastName  = fake()->lastName();
        $slug      = strtolower("{$firstName}.{$lastName}");

        return [
            'university'    => fake()->randomElement($universities),
            'bio'           => fake()->randomElement($bios),
            'phone'         => fake()->phoneNumber(),
            'linkedin_link' => "https://linkedin.com/in/{$slug}-" . fake()->numerify('###'),
            'github_link'   => "https://github.com/{$slug}" . fake()->numerify('##'),
            'languages'     => fake()->randomElement($languageSets),
            'cv_path'       => null,
        ];
    }
}
