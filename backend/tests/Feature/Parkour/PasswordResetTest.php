<?php

use App\Models\User;
use App\Notifications\AdminResetPasswordNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

function resetAccount(): User
{
    return User::query()->where('email', env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com'))->firstOrFail();
}

/** Asks for a link and returns the token the email carried. */
function requestResetToken($test, User $user): string
{
    $test->postJson('/api/admin/me/password/forgot', ['email' => $user->email])->assertOk();

    $token = null;
    Notification::assertSentTo($user, AdminResetPasswordNotification::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    return $token;
}

beforeEach(fn () => Notification::fake());

it('emails an active admin a link to the dashboard reset page', function () {
    $user = resetAccount();

    $this->postJson('/api/admin/me/password/forgot', ['email' => $user->email])->assertOk();

    Notification::assertSentTo($user, AdminResetPasswordNotification::class, function ($notification) use ($user) {
        $url = $notification->resetUrl($user);

        return str_starts_with($url, rtrim(config('app.admin_dashboard_base_url'), '/').'/reset-password?')
            && str_contains($url, 'token='.$notification->token)
            && str_contains($url, 'email='.urlencode($user->email));
    });
});

it('answers alike for unknown, inactive and non-admin emails, and sends nothing', function () {
    $known = $this->postJson('/api/admin/me/password/forgot', ['email' => resetAccount()->email])->json();

    $inactive = User::query()->create(['email' => 'off@example.test', 'password' => bcrypt('x'), 'type' => 'ADMIN', 'active' => false]);
    $customer = User::query()->create(['email' => 'shop@example.test', 'password' => bcrypt('x'), 'type' => 'CUSTOMER', 'active' => true]);

    foreach (['nobody@example.test', $inactive->email, $customer->email] as $email) {
        expect($this->postJson('/api/admin/me/password/forgot', ['email' => $email])->assertOk()->json())->toBe($known);
    }

    Notification::assertNotSentTo([$inactive, $customer], AdminResetPasswordNotification::class);
});

it('resets the password with the emailed token and signs the account out everywhere', function () {
    $user = resetAccount();
    $session = $this->postJson('/api/admin/auth/login', [
        'email' => $user->email, 'password' => env('SEED_SUPERVISOR_PASSWORD', 'password'),
    ])->json('data');
    $token = requestResetToken($this, $user);

    $this->postJson('/api/admin/me/password/reset', [
        'email' => $user->email, 'token' => $token, 'password' => 'BrandNew123', 'passwordConfirmation' => 'BrandNew123',
    ])->assertOk();

    expect(Hash::check('BrandNew123', $user->fresh()->password))->toBeTrue()
        ->and(Token::query()->where('user_id', $user->id)->where('revoked', false)->exists())->toBeFalse()
        ->and(RefreshToken::query()->find($session['refreshToken'])->revoked)->toBeTrue();
});

it('accepts a token only once', function () {
    $user = resetAccount();
    $token = requestResetToken($this, $user);
    $body = ['email' => $user->email, 'token' => $token, 'password' => 'BrandNew123', 'passwordConfirmation' => 'BrandNew123'];

    $this->postJson('/api/admin/me/password/reset', $body)->assertOk();
    $this->postJson('/api/admin/me/password/reset', $body)->assertStatus(422);
});

it('refuses an expired, foreign or made-up token', function () {
    $user = resetAccount();
    $token = requestResetToken($this, $user);
    $other = User::query()->create(['email' => 'other@example.test', 'password' => bcrypt('x'), 'type' => 'ADMIN', 'active' => true]);
    $body = fn (string $email, string $token) => ['email' => $email, 'token' => $token, 'password' => 'BrandNew123', 'passwordConfirmation' => 'BrandNew123'];

    $this->postJson('/api/admin/me/password/reset', $body($user->email, 'made-up'))->assertStatus(422);
    $this->postJson('/api/admin/me/password/reset', $body($other->email, $token))->assertStatus(422);

    $this->travel(61)->minutes();
    $this->postJson('/api/admin/me/password/reset', $body($user->email, $token))->assertStatus(422);

    expect(Hash::check('BrandNew123', $user->fresh()->password))->toBeFalse();
});

it('refuses a reset for an account deactivated after the link was sent', function () {
    $user = resetAccount();
    $token = requestResetToken($this, $user);
    $user->update(['active' => false]);

    $this->postJson('/api/admin/me/password/reset', [
        'email' => $user->email, 'token' => $token, 'password' => 'BrandNew123', 'passwordConfirmation' => 'BrandNew123',
    ])->assertStatus(422);
});

it('holds the new password to the password policy', function () {
    $user = resetAccount();
    $token = requestResetToken($this, $user);

    $this->postJson('/api/admin/me/password/reset', [
        'email' => $user->email, 'token' => $token, 'password' => 'short', 'passwordConfirmation' => 'short',
    ])->assertStatus(422);
});

it('rate limits both endpoints', function () {
    $forgot = collect(range(1, 6))->map(fn () => $this->postJson('/api/admin/me/password/forgot', ['email' => 'nobody@example.test'])->status());
    $reset = collect(range(1, 6))->map(fn () => $this->postJson('/api/admin/me/password/reset', [
        'email' => 'nobody@example.test', 'token' => 'x', 'password' => 'BrandNew123', 'passwordConfirmation' => 'BrandNew123',
    ])->status());

    expect($forgot->last())->toBe(429)->and($reset->last())->toBe(429);
});

it('renders the reset email with its link and expiry', function () {
    $user = resetAccount();
    $notification = new AdminResetPasswordNotification('a-token');

    $html = (string) $notification->toMail($user)->render();

    expect($html)->toContain(e($notification->resetUrl($user)))
        ->toContain(e(__('passwords.mail_expiry', ['count' => 60])));
});
