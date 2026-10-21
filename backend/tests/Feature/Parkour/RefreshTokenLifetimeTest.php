<?php

use Laravel\Passport\RefreshToken;

function loginSupervisor($test): array
{
    return $test->postJson('/api/admin/auth/login', [
        'email' => env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com'),
        'password' => env('SEED_SUPERVISOR_PASSWORD', 'password'),
    ])->assertOk()->json('data');
}

it('issues refresh tokens that last seven days', function () {
    $this->freezeSecond();

    $session = loginSupervisor($this);

    expect(RefreshToken::query()->find($session['refreshToken'])->expires_at->equalTo(now()->addDays(7)))->toBeTrue();
});

it('gives a rotated refresh token the same lifetime', function () {
    $this->freezeSecond();
    $session = loginSupervisor($this);

    $rotated = $this->postJson('/api/admin/auth/refresh-token', ['refreshToken' => $session['refreshToken']])
        ->assertOk()->json('data.refreshToken');

    expect(RefreshToken::query()->find($rotated)->expires_at->equalTo(now()->addDays(7)))->toBeTrue();
});

it('refuses a refresh token past its lifetime', function () {
    $session = loginSupervisor($this);

    $this->travel(8)->days();

    $this->postJson('/api/admin/auth/refresh-token', ['refreshToken' => $session['refreshToken']])->assertUnauthorized();
});

it('reads the lifetime from config', function () {
    config(['auth.refresh_token_ttl_days' => 2]);
    $this->freezeSecond();

    $session = loginSupervisor($this);

    expect(RefreshToken::query()->find($session['refreshToken'])->expires_at->equalTo(now()->addDays(2)))->toBeTrue();
});
