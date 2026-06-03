<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedComment;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolve the polymorphic author/liker model for the authenticated user.
     *
     * Students → their StudentProfile record
     * Companies → their Company record
     *
     * Returns null when neither relation exists (prevents orphan records).
     */
    private function resolveAuthor(Request $request): \Illuminate\Database\Eloquent\Model|null
    {
        $user = $request->user();

        if ($user->isStudent()) {
            return $user->studentProfile;
        }

        if ($user->isCompany()) {
            return $user->company;
        }

        return null;
    }

    /**
     * Format a single author for JSON output.
     * Returns the display name and avatar URL regardless of author type.
     */
    private function formatAuthor(\Illuminate\Database\Eloquent\Model $author): array
    {
        if ($author instanceof \App\Models\StudentProfile) {
            return [
                'type'       => 'student',
                'id'         => $author->id,
                'name'       => $author->user->name ?? 'Student',
                'avatar_url' => $author->user->avatar_url ?? null,
            ];
        }

        return [
            'type'       => 'company',
            'id'         => $author->id,
            'name'       => $author->company_name ?? 'Company',
            'avatar_url' => $author->user->avatar_url ?? null,
        ];
    }

    /**
     * Format a single post (with nested comments + likes) for the API response.
     *
     * @param  Post                                            $post
     * @param  \Illuminate\Database\Eloquent\Model|null       $viewer  — the resolved author of the requesting user
     */
    private function formatPost(Post $post, ?\Illuminate\Database\Eloquent\Model $viewer = null): array
    {
        $author = $post->author;

        // Determine whether the current viewer has liked this post
        $isLikedByMe = false;
        if ($viewer) {
            $viewerType  = get_class($viewer);
            $viewerId    = $viewer->id;
            $isLikedByMe = $post->likes
                ->contains(fn ($like) => $like->liker_type === $viewerType && $like->liker_id === $viewerId);
        }

        return [
            'id'             => $post->id,
            'body'           => $post->body,
            'author'         => $author ? $this->formatAuthor($author) : null,
            'created_at'     => $post->created_at->toIso8601String(),
            'likes_count'    => $post->likes->count(),
            'is_liked_by_me' => $isLikedByMe,
            'comments'       => $post->feedComments->map(function (FeedComment $c) {
                $cAuthor = $c->author;
                return [
                    'id'         => $c->id,
                    'body'       => $c->body,
                    'author'     => $cAuthor ? $this->formatAuthor($cAuthor) : null,
                    'created_at' => $c->created_at->toIso8601String(),
                ];
            })->values(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Endpoints
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/feed
     *
     * Returns all posts (newest first) with authors, comments, and like data.
     * Eager-loads everything to avoid N+1 issues.
     */
    public function index(Request $request): JsonResponse
    {
        $viewer = $this->resolveAuthor($request);

        $posts = Post::with([
            'author',
            'author.user',
            'feedComments.author',
            'feedComments.author.user',
            'likes',
        ])->latest()->get();

        return response()->json([
            'posts' => $posts->map(fn (Post $p) => $this->formatPost($p, $viewer))->values(),
        ]);
    }

    /**
     * POST /api/feed/posts
     *
     * Creates a new post authored by the authenticated user's profile/company.
     */
    public function storePost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $author = $this->resolveAuthor($request);

        if (! $author) {
            return response()->json(['message' => 'Author profile not found.'], 403);
        }

        $post = Post::create([
            'body'        => $validated['body'],
            'author_type' => get_class($author),
            'author_id'   => $author->id,
        ]);

        $post->load(['author', 'author.user', 'feedComments', 'likes']);

        return response()->json([
            'message' => 'Post created successfully.',
            'post'    => $this->formatPost($post, $author),
        ], 201);
    }

    /**
     * PUT /api/feed/posts/{post}
     *
     * Allows the original author to edit their post body.
     */
    public function updatePost(Request $request, Post $post): JsonResponse
    {
        $author = $this->resolveAuthor($request);

        if (
            ! $author ||
            $post->author_type !== get_class($author) ||
            $post->author_id   !== $author->id
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $post->update(['body' => $validated['body']]);

        return response()->json([
            'message' => 'Post updated.',
            'post'    => ['id' => $post->id, 'body' => $post->body],
        ]);
    }

    /**
     * DELETE /api/feed/posts/{post}
     *
     * Deletes a post. Only the original author may delete their own post.
     * DB cascade removes associated feed_comments and post_likes automatically.
     */
    public function destroyPost(Request $request, Post $post): JsonResponse
    {
        $author = $this->resolveAuthor($request);

        if (
            ! $author ||
            $post->author_type !== get_class($author) ||
            $post->author_id   !== $author->id
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }

    /**
     * POST /api/feed/posts/{post}/comments
     *
     * Adds a comment to a post authored by the authenticated user.
     */
    public function storeComment(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $author = $this->resolveAuthor($request);

        if (! $author) {
            return response()->json(['message' => 'Author profile not found.'], 403);
        }

        $comment = FeedComment::create([
            'post_id'     => $post->id,
            'body'        => $validated['body'],
            'author_type' => get_class($author),
            'author_id'   => $author->id,
        ]);

        $comment->load(['author', 'author.user']);

        return response()->json([
            'message' => 'Comment added.',
            'comment' => [
                'id'         => $comment->id,
                'body'       => $comment->body,
                'author'     => $comment->author ? $this->formatAuthor($comment->author) : null,
                'created_at' => $comment->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * DELETE /api/feed/comments/{comment}
     *
     * A comment may be deleted by:
     *   1. The comment's own author.
     *   2. The author of the parent post (moderation right).
     */
    public function destroyComment(Request $request, FeedComment $comment): JsonResponse
    {
        $author = $this->resolveAuthor($request);

        if (! $author) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $isCommentAuthor = $comment->author_type === get_class($author)
            && $comment->author_id === $author->id;

        $post        = $comment->post;
        $isPostOwner = $post->author_type === get_class($author)
            && $post->author_id === $author->id;

        if (! $isCommentAuthor && ! $isPostOwner) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }

    /**
     * POST /api/feed/posts/{post}/like
     *
     * Toggles a like on a post for the authenticated user.
     * Returns the updated likes_count and new is_liked_by_me state.
     */
    public function toggleLike(Request $request, Post $post): JsonResponse
    {
        $author = $this->resolveAuthor($request);

        if (! $author) {
            return response()->json(['message' => 'Author profile not found.'], 403);
        }

        $likerType = get_class($author);
        $likerId   = $author->id;

        $existing = PostLike::where('post_id',    $post->id)
            ->where('liker_type', $likerType)
            ->where('liker_id',   $likerId)
            ->first();

        if ($existing) {
            // Unlike
            $existing->delete();
            $liked = false;
        } else {
            // Like
            PostLike::create([
                'post_id'    => $post->id,
                'liker_type' => $likerType,
                'liker_id'   => $likerId,
            ]);
            $liked = true;
        }

        $likesCount = PostLike::where('post_id', $post->id)->count();

        return response()->json([
            'is_liked_by_me' => $liked,
            'likes_count'    => $likesCount,
        ]);
    }
}
