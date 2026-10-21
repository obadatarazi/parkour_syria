<?php

namespace Tests\Feature;

use App\Enum\UserType;
use App\Models\User;
use App\Services\AuthService;
use Database\Seeders\PassportClientSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;
use Tests\TestCase;

/**
 * Website refresh must work without a live bearer (access tokens expire after an hour of idle),
 * and parallel tabs that race the same refresh token must get the same new pair during the grace window.
 */
class RefreshTokenTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PassportClientSeeder::class);
    }

    private function makeAdmin(): User
    {
        $suffix = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return User::query()->forceCreate([
            'full_name' => 'Refresh Tester',
            'email' => 'refresh.tester.'.$suffix.'@example.com',
            'phone_number' => '9639'.$suffix.'0',
            'password' => bcrypt('password'),
            'type' => UserType::ADMIN->value,
            'active' => true,
        ]);
    }

    /**
     * @return array{token: string, refreshToken: string}
     */
    private function issuePair(User $user): array
    {
        return app(AuthService::class)->createToken($user);
    }

    public function test_refresh_succeeds_without_bearer(): void
    {
        $pair = $this->issuePair($this->makeAdmin());

        $response = $this->postJson('/api/admin/auth/refresh-token', [
            'refreshToken' => $pair['refreshToken'],
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.token'));
        $this->assertNotEmpty($response->json('data.refreshToken'));
        $this->assertNotSame($pair['token'], $response->json('data.token'));
        $this->assertNotSame($pair['refreshToken'], $response->json('data.refreshToken'));
    }

    public function test_refresh_succeeds_with_expired_access_token_bearer(): void
    {
        $pair = $this->issuePair($this->makeAdmin());

        Token::query()
            ->where('id', RefreshToken::query()->where('id', $pair['refreshToken'])->value('access_token_id'))
            ->update(['expires_at' => now()->subHour()]);

        $response = $this->withHeader('Authorization', 'Bearer '.$pair['token'])
            ->postJson('/api/admin/auth/refresh-token', [
                'refreshToken' => $pair['refreshToken'],
            ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.token'));
        $this->assertNotEmpty($response->json('data.refreshToken'));
    }

    public function test_reusing_refresh_token_within_grace_returns_same_pair(): void
    {
        $pair = $this->issuePair($this->makeAdmin());

        $first = $this->postJson('/api/admin/auth/refresh-token', [
            'refreshToken' => $pair['refreshToken'],
        ])->assertOk()->json('data');

        $second = $this->postJson('/api/admin/auth/refresh-token', [
            'refreshToken' => $pair['refreshToken'],
        ])->assertOk()->json('data');

        $this->assertSame($first['token'], $second['token']);
        $this->assertSame($first['refreshToken'], $second['refreshToken']);
        $this->assertTrue(Cache::has('auth:refresh:result:'.$pair['refreshToken']));
    }

    public function test_expired_refresh_token_returns_401(): void
    {
        $pair = $this->issuePair($this->makeAdmin());

        RefreshToken::query()
            ->where('id', $pair['refreshToken'])
            ->update(['expires_at' => now()->subMinute()]);

        $this->postJson('/api/admin/auth/refresh-token', [
            'refreshToken' => $pair['refreshToken'],
        ])->assertUnauthorized();
    }

    public function test_revoked_refresh_token_outside_grace_returns_401(): void
    {
        $pair = $this->issuePair($this->makeAdmin());

        RefreshToken::query()
            ->where('id', $pair['refreshToken'])
            ->update(['revoked' => true]);

        Cache::forget('auth:refresh:result:'.$pair['refreshToken']);

        $this->postJson('/api/admin/auth/refresh-token', [
            'refreshToken' => $pair['refreshToken'],
        ])->assertUnauthorized();
    }
}
