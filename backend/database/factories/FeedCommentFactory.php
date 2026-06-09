<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\FeedComment;
use App\Models\Post;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedComment>
 */
class FeedCommentFactory extends Factory
{
    protected $model = FeedComment::class;

    public function definition(): array
    {
        $comments = [
            // Agreeing / expanding
            "100% this. Took me a while to realise too but once it clicked everything changed.",
            "Couldn't agree more. The soft skills nobody teaches you end up mattering just as much as the technical ones.",
            "This is exactly the advice I needed to hear before my first internship. Saving this post.",
            "Seconding this — our team does daily standups and learning to communicate blockers early saved so many potential delays.",
            "Great point. I'd also add: don't underestimate the value of writing things down. Documenting what you learn is underrated.",
            "Yes! Code reviews were eye-opening for me. You learn so much from just seeing how experienced engineers think through problems.",

            // Sharing experience
            "I went through the exact same experience. The first PR review was humbling but that feedback loop is what accelerates growth.",
            "Same here. My first two weeks I barely wrote any new code — mostly just tracing through the codebase to understand how it all fits together.",
            "This resonates. I keep a dev diary and it's amazing to look back and see how much has changed in just 8 weeks.",
            "Totally felt the imposter syndrome in week one. What helped me was realising that my manager hired me *knowing* I was a student.",

            // Technical opinions
            "TypeScript is absolutely worth it even on smaller projects. The autocomplete alone saves so much time and the type errors catch bugs before runtime.",
            "We made the REST → GraphQL switch last year. The migration was painful but the result is cleaner. Just make sure your team understands the N+1 problem first.",
            "Docker is non-negotiable at this point. The cognitive overhead of managing environments manually just isn't worth it.",
            "Trunk-based development works beautifully with feature flags. Once your team gets comfortable with it, velocity really picks up.",
            "Hot take: Git history is a communication tool. Write meaningful commit messages and future you (and your team) will thank you.",
            "The database migrations point is so real. I once saw someone ALTER TABLE in production manually and it nearly caused a major incident.",

            // Questions / engagement
            "This is really helpful! Do you have any resources you'd recommend for getting better at reading unfamiliar codebases?",
            "How long did it take before you felt truly comfortable in the codebase? I'm 3 weeks in and still feel a bit lost.",
            "Great advice! Any tips specifically for remote internships? The communication aspect feels even harder without the in-person context.",
            "Love this perspective. What would you say was the single biggest mistake you made early in the internship?",
            "Appreciate you sharing this — did you have any prior experience or was this your first internship?",

            // Encouragement
            "Keep going! The rejection phase is universal — every engineer I've talked to has a story of 10+ rejections before the offer that changed things.",
            "This is so motivating. Bookmarking this for the next time I feel like giving up during the application process.",
            "Congratulations! Stories like this are what keep me going during the grind. Well deserved.",
            "Seriously inspiring. Thank you for sharing — this community needs more posts like this.",
        ];

        // Polymorphic author — 55% student, 45% company for variety
        $useStudent = fake()->boolean(55);
        $author     = $useStudent
            ? StudentProfile::inRandomOrder()->first()
            : Company::inRandomOrder()->first();

        if (! $author) {
            $author = StudentProfile::inRandomOrder()->first() ?? Company::inRandomOrder()->first();
        }

        return [
            'post_id'     => Post::inRandomOrder()->first()?->id ?? Post::factory(),
            'body'        => fake()->randomElement($comments),
            'author_type' => get_class($author),
            'author_id'   => $author->id,
            'created_at'  => fake()->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
