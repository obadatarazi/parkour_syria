<?php

namespace App\Services;

use App\Enum\UserType;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/**
 * Password reset by email for dashboard accounts, on Laravel's password broker: the token is random,
 * stored hashed, expires after `auth.passwords.users.expire` minutes, is deleted once used, and one
 * email gets at most one link per `auth.passwords.users.throttle` seconds.
 */
class PasswordResetService
{
    public function __construct(protected TokenRevocationService $tokenRevocationService) {}

    /**
     * Sends a reset link when the email belongs to an active dashboard account. The caller answers
     * the same either way, so the endpoint never tells which emails have an account.
     */
    public function sendResetLink(string $email): void
    {
        if ($this->eligibleUser($email) === null) {
            return;
        }

        // A throttled request is not reported either: it would confirm the account exists.
        Password::broker()->sendResetLink(['email' => $email]);
    }

    /**
     * Sets the new password when the token is valid for that email, and ends every session the
     * account had: whoever asked for the reset may be locking someone else out.
     *
     * @return bool Whether the password was reset.
     */
    public function reset(string $email, string $token, string $password): bool
    {
        if ($this->eligibleUser($email) === null) {
            return false;
        }

        $status = Password::broker()->reset(
            ['email' => $email, 'token' => $token, 'password' => $password],
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();

                $this->tokenRevocationService->revokeAll($user);

                event(new PasswordReset($user));
            },
        );

        return $status === Password::PASSWORD_RESET;
    }

    private function eligibleUser(string $email): ?User
    {
        return User::query()
            ->where('email', $email)
            ->where('type', UserType::ADMIN->value)
            ->where('active', true)
            ->first();
    }
}
