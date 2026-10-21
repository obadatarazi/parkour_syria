<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The reset link a dashboard account receives. It opens the dashboard's own reset page, which posts
 * the token back to /api/admin/me/password/reset.
 */
class AdminResetPasswordNotification extends Notification
{
    public function __construct(public readonly string $token) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function resetUrl(object $notifiable): string
    {
        return rtrim((string) config('app.admin_dashboard_base_url'), '/').'/reset-password?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $minutes = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject(__('passwords.mail_subject'))
            ->line(__('passwords.mail_intro'))
            ->action(__('passwords.mail_action'), $this->resetUrl($notifiable))
            ->line(__('passwords.mail_expiry', ['count' => $minutes]))
            ->line(__('passwords.mail_ignore'));
    }
}
