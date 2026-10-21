<?php

it('logs a dashboard account in and returns a token pair', function () {
    $response = $this->postJson('/api/admin/auth/login', [
        'email' => 'admin@parkoursyria.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['user' => ['id', 'email', 'roles'], 'token', 'refreshToken']]);
});

it('rejects a wrong password', function () {
    $this->postJson('/api/admin/auth/login', [
        'email' => 'admin@parkoursyria.com',
        'password' => 'nope',
    ])->assertUnauthorized()->assertJsonPath('success', false);
});

it('keeps the admin api behind a token', function () {
    $this->getJson('/api/admin/lessons')->assertUnauthorized();
});

it('returns the signed in profile with its permissions', function () {
    $this->actingAsSupervisor();

    $this->getJson('/api/admin/me/roles')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'supervisor');
});
