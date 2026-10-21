<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;

it('answers a wrong password the same for an unknown and a non-admin account', function () {
    User::query()->create(['email' => 'customer@example.test', 'password' => bcrypt('Right123'), 'type' => 'CUSTOMER', 'active' => true]);

    $unknown = $this->postJson('/api/admin/auth/login', ['email' => 'nobody@example.test', 'password' => 'Wrong123']);
    $customer = $this->postJson('/api/admin/auth/login', ['email' => 'customer@example.test', 'password' => 'Wrong123']);

    expect($customer->status())->toBe($unknown->status())
        ->and($customer->json('error'))->toBe($unknown->json('error'));
});

it('still turns a non-admin account away with the right password', function () {
    User::query()->create(['email' => 'customer@example.test', 'password' => bcrypt('Right123'), 'type' => 'CUSTOMER', 'active' => true]);

    $this->postJson('/api/admin/auth/login', ['email' => 'customer@example.test', 'password' => 'Right123'])
        ->assertUnauthorized()
        ->assertJsonPath('error', __('exceptions.only_admin'));
});

it('asks for a password of 8 characters with letters and numbers', function (string $weak) {
    $this->actingAsSuperAdmin();

    $this->postJson('/api/admin/users', [
        'email' => 'new@example.test', 'password' => $weak, 'password_confirmation' => $weak, 'type' => 'ADMIN',
    ])->assertStatus(422);
})->with(['short1', 'lettersonly', '12345678']);

it('keeps the current password when an edit sends a blank one', function () {
    $this->actingAsSuperAdmin();
    $plain = User::query()->create(['email' => 'plain@example.test', 'password' => bcrypt('Kept1234'), 'type' => 'ADMIN', 'active' => true]);

    $this->putJson("/api/admin/users/{$plain->id}", ['password' => '', 'full_name' => 'Same'])->assertOk();

    expect(Hash::check('Kept1234', $plain->fresh()->password))->toBeTrue();
});

it('limits password change attempts', function () {
    $this->actingAsSupervisor();

    $statuses = collect(range(1, 6))->map(fn () => $this->postJson('/api/admin/me/password/change', [
        'current_password' => 'Wrong123', 'new_password' => 'Changed123', 'new_password_confirmation' => 'Changed123',
    ])->status());

    expect($statuses->last())->toBe(429);
});

it('keeps the permission catalogue to role managers', function () {
    $this->actingAsSupervisor();
    $this->getJson('/api/admin/role/list')->assertForbidden();
    $this->getJson('/api/admin/role/by-section')->assertForbidden();

    $this->actingAsSuperAdmin();
    $this->getJson('/api/admin/role/list')->assertOk();
    $this->getJson('/api/admin/role/by-section')->assertOk();
});

it('refuses to seed a blank or fallback password outside a developer machine', function (string $password) {
    $saved = [$_SERVER['SEED_SUPER_ADMIN_PASSWORD'] ?? null, $_ENV['SEED_SUPER_ADMIN_PASSWORD'] ?? null];
    $_SERVER['SEED_SUPER_ADMIN_PASSWORD'] = $_ENV['SEED_SUPER_ADMIN_PASSWORD'] = $password;
    $this->app->detectEnvironment(fn () => 'staging');

    try {
        expect(fn () => $this->seed(AdminUserSeeder::class))->toThrow(RuntimeException::class);
    } finally {
        [$_SERVER['SEED_SUPER_ADMIN_PASSWORD'], $_ENV['SEED_SUPER_ADMIN_PASSWORD']] = $saved;
    }
})->with(['password', '']);
