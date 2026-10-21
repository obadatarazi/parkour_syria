<?php

use Illuminate\Support\Facades\Route;

function preflight($test, string $origin)
{
    return $test->call('OPTIONS', '/api/home', [], [], [], [
        'HTTP_ORIGIN' => $origin,
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
    ]);
}

it('hides the api documentation outside local when no credentials are set', function () {
    config(['l5-swagger.access.user' => null, 'l5-swagger.access.password' => null]);

    $this->get('/api/doc')->assertNotFound();
    $this->get('/docs')->assertNotFound();
});

it('asks for the documentation credentials once they are set', function () {
    config(['l5-swagger.access.user' => 'docs', 'l5-swagger.access.password' => 'docs-secret']);

    $this->get('/api/doc')->assertUnauthorized()->assertHeader('WWW-Authenticate');
    $this->withBasicAuth('docs', 'wrong')->get('/api/doc')->assertUnauthorized();
    $this->withBasicAuth('docs', 'docs-secret')->get('/api/doc')->assertOk();
});

it('opens the documentation on a developer machine', function () {
    $this->app->detectEnvironment(fn () => 'local');

    $this->get('/api/doc')->assertOk();
});

it('answers cors only for the website and the dashboard', function () {
    $admin = rtrim(env('ADMIN_DASHBOARD_BASE_URL', 'https://admin.parkoursyria.com'), '/');

    expect(preflight($this, $admin)->headers->get('Access-Control-Allow-Origin'))->toBe($admin);
    expect(preflight($this, 'https://elsewhere.example')->headers->get('Access-Control-Allow-Origin'))->toBeNull();
});

it('does not register the unused passport oauth routes', function () {
    expect(Route::has('passport.token'))->toBeFalse()
        ->and(Route::has('passport.authorizations.authorize'))->toBeFalse()
        ->and(Route::has('passport.device.code'))->toBeFalse();
});
