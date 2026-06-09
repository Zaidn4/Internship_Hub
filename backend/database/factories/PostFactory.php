<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Post;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $bodies = [
            // Tips & advice
            "Just finished my first week as a backend intern — honestly, the biggest surprise was how much time goes into code reviews rather than writing code. Anyone else find that at first?",
            "Hot take: Reading other people's code is a more valuable skill than writing your own. Three months into my internship and I spend 60% of my time just understanding existing systems.",
            "Tip for anyone applying to internships: personalise your cover letter to the actual tech stack. Mentioning their specific tools (not just 'I love JavaScript') made a huge difference in my response rate.",
            "Finished my first real pull request that went to production today. The feeling of seeing your code live is indescribable. If you're hesitating to apply — just go for it.",
            "One thing they don't teach you in university: how to ask for help without feeling like you're bothering senior engineers. The trick is coming with context + a question, not just 'it doesn't work'.",
            "PSA: Update your GitHub before applying. Recruiters DO look at it. Even one pinned project with a good README makes you stand out.",
            "After 3 rejections and 2 months of grinding LeetCode, I finally got an offer from a company I actually care about. The process is brutal but keep going.",
            "Imposter syndrome is real in the first few weeks of an internship. What helped me: writing down one thing I learned every day. It adds up faster than you think.",

            // Tech discussions
            "We just migrated our API from REST to GraphQL and I'm genuinely surprised by how much cleaner the client code became. Has anyone else made this switch? Was it worth it for you?",
            "Is TypeScript actually worth the overhead for smaller projects, or is it only justified at scale? Asking because my team is debating it for our next service.",
            "Docker has fundamentally changed how I think about development environments. The idea of 'works on my machine' feels prehistoric now. What's your local dev setup looking like?",
            "Anyone here doing systems design prep for internship interviews? I feel like the resources for entry-level are sparse compared to the senior-level content out there.",
            "React vs Vue vs Svelte — stop me if you've heard this one. But genuinely curious what stack people are using for new projects in 2024.",
            "My team introduced me to trunk-based development this week. Coming from feature branch workflows, it felt scary at first but I can already see why high-performing teams prefer it.",
            "Just discovered the concept of database migrations and I'm genuinely embarrassed it took me this long. If you're still making manual SQL changes to prod, please stop.",

            // Company posts (recruiting tone)
            "We're hiring interns for our summer cohort! If you're passionate about distributed systems and want to work on infrastructure used by millions, check out our careers page. DM me with questions.",
            "Just wrapped up our intern demo day and I'm blown away by what the team built in 10 weeks. Shoutout to our interns — you shipped production features, not toy projects. Applications for next cohort opening soon.",
            "What makes a great internship candidate? Honestly: intellectual curiosity > polished resume. We'd rather hire someone who's built weird side projects than someone with a flawless GPA and no shipped code.",
            "We believe the best way to learn engineering is by doing real work. Our interns own features end-to-end — from design doc to deployment. No coffee fetching here.",
            "Reminder that our internship applications close in two weeks. We're looking for students passionate about ML infrastructure and data pipelines. Link in bio!",

            // Motivational / reflective
            "Six months ago I had zero real-world experience. Today I'm wrapping up my internship having shipped code used by real users, and I have a return offer. Keep applying, keep building.",
            "Something I wish someone told me: the internship application process is a numbers game AND a quality game. Volume matters, but so does targeting the right companies for your level.",
            "Biggest skill I developed this summer wasn't technical — it was learning how to communicate progress and blockers clearly and early. Saved my team from so many fire drills.",
        ];

        // Pick a random polymorphic author (StudentProfile or Company)
        $useStudent = fake()->boolean(60); // 60% chance student, 40% company

        if ($useStudent) {
            $author = StudentProfile::inRandomOrder()->first();
        } else {
            $author = Company::inRandomOrder()->first();
        }

        // Fallback if either table is empty
        if (! $author) {
            $author = StudentProfile::inRandomOrder()->first() ?? Company::inRandomOrder()->first();
        }

        return [
            'body'        => fake()->randomElement($bodies),
            'author_type' => get_class($author),
            'author_id'   => $author->id,
            'created_at'  => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
