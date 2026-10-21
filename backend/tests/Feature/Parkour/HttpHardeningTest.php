<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

it('sends the hardening headers with every api answer', function () {
    $response = $this->getJson('/api/home')->assertOk();

    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    expect($response->headers->get('Permissions-Policy'))->toContain('camera=()');
});

it('leaves the content policy off the html the website serves', function () {
    $response = $this->get('/');

    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeaderMissing('Content-Security-Policy');
});

it('ignores forwarded addresses while no proxy is trusted', function () {
    Route::get('/api/__test-ip', fn () => request()->ip());

    $ip = $this->withServerVariables(['REMOTE_ADDR' => '10.1.1.1'])
        ->withHeader('X-Forwarded-For', '203.0.113.9')
        ->get('/api/__test-ip')->getContent();

    expect($ip)->toBe('10.1.1.1');
});

it('believes the forwarded address from a trusted proxy', function () {
    config(['trustedproxy.proxies' => '10.1.1.1']);
    Route::get('/api/__test-ip', fn () => request()->ip());

    $ip = $this->withServerVariables(['REMOTE_ADDR' => '10.1.1.1'])
        ->withHeader('X-Forwarded-For', '203.0.113.9')
        ->get('/api/__test-ip')->getContent();

    expect($ip)->toBe('203.0.113.9');
});

it('keeps the spaces of a new password', function () {
    $password = env('SEED_SUPERVISOR_PASSWORD', 'password');
    $email = env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com');
    $token = $this->postJson('/api/admin/auth/login', ['email' => $email, 'password' => $password])->json('data.token');

    $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/admin/me/password/change', [
        'currentPassword' => $password,
        'newPassword' => '  spaced pass  ',
        'newPasswordConfirmation' => '  spaced pass  ',
    ])->assertOk();

    expect(Hash::check('  spaced pass  ', User::query()->where('email', $email)->value('password')))->toBeTrue();
});

it('trims ordinary text fields', function () {
    $this->actingAsSuperAdmin();
    $plain = User::query()->create(['email' => 'plain@example.test', 'password' => bcrypt('x'), 'type' => 'ADMIN', 'active' => true]);

    $this->putJson("/api/admin/users/{$plain->id}", ['fullName' => '  Padded  '])->assertOk();

    expect($plain->fresh()->full_name)->toBe('Padded');
});
