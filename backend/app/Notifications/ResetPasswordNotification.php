<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Overrides Laravel's default password reset notification so the reset link
 * points to our React frontend (Vite dev server) instead of a Blade route.
 *
 * URL format:
 *   http://localhost:5173/reset-password?token={token}&email={email}
 */
class ResetPasswordNotification extends BaseResetPassword
{
    /**
     * Build the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Reset Your Password — Internship Platform')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . ',')
            ->line('We received a request to reset the password for your account.')
            ->action('Reset Password', $url)
            ->line('This link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.')
            ->salutation('The Internship Platform Team');
    }

    /**
     * Build the reset URL pointing to the React SPA instead of a Laravel Blade route.
     */
    protected function resetUrl(mixed $notifiable): string
    {
        return 'http://localhost:5173/reset-password'
            . '?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
    }
}
