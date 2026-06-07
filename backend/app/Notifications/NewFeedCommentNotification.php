<?php

namespace App\Notifications;

use App\Models\FeedComment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewFeedCommentNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly FeedComment $comment,
        private readonly string      $commenterName,
    ) {}

    /**
     * Store in the database only — no mail, no push.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Payload stored in notifications.data (JSON column).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'            => 'new_feed_comment',
            'post_id'         => $this->comment->post_id,
            'comment_id'      => $this->comment->id,
            'commenter_name'  => $this->commenterName,
            'message'         => "{$this->commenterName} commented on your post.",
        ];
    }
}
