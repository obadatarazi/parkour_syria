<?php

use App\Models\Role;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/api/__test-unexpected-error', fn () => throw new RuntimeException(
        'SQLSTATE[HY000] Connection: mysql, Host: 10.0.0.5 in /var/www/app/Services/Secret.php'
    ));
});

it('answers an unexpected error with a generic message outside debug', function () {
    config(['app.debug' => false]);

    $body = $this->getJson('/api/__test-unexpected-error')->assertStatus(500)->getContent();

    expect($body)->not->toContain('SQLSTATE')->not->toContain('/var/www')->not->toContain('10.0.0.5');
});

it('still shows the real message while debugging', function () {
    config(['app.debug' => true]);

    $this->getJson('/api/__test-unexpected-error')->assertStatus(500)->assertSee('SQLSTATE');
});

it('asks for a refresh token instead of failing on its absence', function () {
    config(['app.debug' => false]);

    $body = $this->postJson('/api/admin/auth/refresh-token', [])->assertStatus(422)->getContent();

    expect($body)->not->toContain('AuthService')->not->toContain(base_path());
});

it('creates a role without the standard flag', function () {
    $this->actingAsSuperAdmin();

    $this->postJson('/api/admin/roles', ['name' => 'no-standard'])->assertCreated();

    expect(Role::query()->where('name', 'no-standard')->value('standard'))->toBe(0);
});
