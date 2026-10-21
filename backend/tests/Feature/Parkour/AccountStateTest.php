<?php

use App\Constant\RoleCode;
use App\Models\Role;
use App\Models\User;

/**
 * Signs the supervisor in for real, so the token is a Passport one the API checks on every call.
 *
 * @return array{token: string, refreshToken: string}
 */
function supervisorSession($test, ?string $password = null): array
{
    $password ??= env('SEED_SUPERVISOR_PASSWORD', 'password');

    return $test->postJson('/api/admin/auth/login', [
        'email' => env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com'),
        'password' => $password,
    ])->assertOk()->json('data');
}

function supervisor(): User
{
    return User::query()->where('email', env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com'))->firstOrFail();
}

/** The next call authenticates from its own header, not from the user the last call resolved. */
function freshAuth($test, string $token)
{
    app('auth')->forgetGuards();

    return $test->withHeader('Authorization', "Bearer {$token}");
}

it('refuses to sign in an inactive account', function () {
    supervisor()->update(['active' => false]);

    $this->postJson('/api/admin/auth/login', [
        'email' => supervisor()->email,
        'password' => env('SEED_SUPERVISOR_PASSWORD', 'password'),
    ])->assertUnauthorized();
});

it('locks a session out the moment its account is deactivated', function () {
    $session = supervisorSession($this);
    supervisor()->update(['active' => false]);

    freshAuth($this, $session['token'])->getJson('/api/admin/lessons')->assertForbidden();
    freshAuth($this, $session['token'])->getJson('/api/admin/auth/account/status')->assertOk()->assertJsonPath('data.status', false);
    $this->postJson('/api/admin/auth/refresh-token', ['refreshToken' => $session['refreshToken']])->assertUnauthorized();
});

it('ends every session when a super admin deactivates the account', function () {
    $session = supervisorSession($this);

    $this->actingAsSuperAdmin();
    $this->putJson('/api/admin/users/'.supervisor()->id, ['active' => false])->assertOk();

    supervisor()->update(['active' => true]);
    freshAuth($this, $session['token'])->getJson('/api/admin/lessons')->assertUnauthorized();
    $this->postJson('/api/admin/auth/refresh-token', ['refreshToken' => $session['refreshToken']])->assertUnauthorized();
});

it('ends every session when a super admin sets a new password', function () {
    $session = supervisorSession($this);

    $this->actingAsSuperAdmin();
    $this->putJson('/api/admin/users/'.supervisor()->id, ['password' => 'Changed123!', 'password_confirmation' => 'Changed123!'])->assertOk();

    freshAuth($this, $session['token'])->getJson('/api/admin/lessons')->assertUnauthorized();
});

it('ends every session when the account gets new roles', function () {
    $session = supervisorSession($this);
    $superAdmin = Role::query()->where('code', RoleCode::SuperAdmin->value)->value('id');

    $this->actingAsSuperAdmin();
    $this->putJson('/api/admin/users/'.supervisor()->id, ['roles' => [$superAdmin]])->assertOk();

    freshAuth($this, $session['token'])->getJson('/api/admin/lessons')->assertUnauthorized();
});

it('keeps sessions when nothing about access changes', function () {
    $session = supervisorSession($this);
    $roles = supervisor()->roles->pluck('id')->all();

    $this->actingAsSuperAdmin();
    $this->putJson('/api/admin/users/'.supervisor()->id, ['full_name' => 'Renamed', 'roles' => $roles])->assertOk();

    freshAuth($this, $session['token'])->getJson('/api/admin/lessons')->assertOk();
});

it('keeps the current session but ends the others on a password change', function () {
    $password = env('SEED_SUPERVISOR_PASSWORD', 'password');
    $other = supervisorSession($this);
    $current = supervisorSession($this);

    freshAuth($this, $current['token'])->postJson('/api/admin/me/password/change', [
        'current_password' => $password,
        'new_password' => 'Changed123!',
        'new_password_confirmation' => 'Changed123!',
    ])->assertOk();

    freshAuth($this, $current['token'])->getJson('/api/admin/lessons')->assertOk();
    freshAuth($this, $other['token'])->getJson('/api/admin/lessons')->assertUnauthorized();
    $this->postJson('/api/admin/auth/refresh-token', ['refreshToken' => $other['refreshToken']])->assertUnauthorized();
});

it('creates dashboard accounts active unless told otherwise', function () {
    $this->actingAsSuperAdmin();

    $this->postJson('/api/admin/users', [
        'email' => 'new@example.test', 'password' => 'Secret123!', 'password_confirmation' => 'Secret123!', 'type' => 'ADMIN',
    ])->assertCreated();

    expect(User::query()->where('email', 'new@example.test')->value('active'))->toBeTrue();
});
