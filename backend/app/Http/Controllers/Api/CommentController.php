<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Internship;
use App\Notifications\NewCommentNotification;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($internshipId)
    {
        $comments = Comment::with('user')
            ->where('internship_id', $internshipId)
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, $internshipId)
    {
        $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $internship = Internship::with('company.user')->findOrFail($internshipId);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'internship_id' => $internship->id,
            'body' => $request->body,
        ]);

        $comment->load('user');

        // Trigger notification if the commenter is not the company that owns the internship
        $companyUser = $internship->company->user;
        
        if ($companyUser && $companyUser->id !== $request->user()->id) {
            $companyUser->notify(new NewCommentNotification($comment));
        }

        return response()->json($comment, 201);
    }

    public function destroy(Request $request, $id)
    {
        $comment = Comment::with('internship.company')->findOrFail($id);

        $isAuthor = $request->user()->id === $comment->user_id;
        $isInternshipOwner = $comment->internship && $comment->internship->company && 
                             $request->user()->id === $comment->internship->company->user_id;

        if (!$isAuthor && !$isInternshipOwner) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }
}
