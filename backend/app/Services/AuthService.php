<?php

namespace App\Services;

use App\Enum\UserType;
use App\Exceptions\Custom\UnauthorizedException;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

class AuthService
{
    public function __construct(protected UserService $userService)
    {
    }

    /**
     * @throws UnauthorizedException
     */
    public function login(array $credentials): bool | array
    {
        if (auth()->attempt($credentials)) {
            $user = auth()->user();

            // Checked only once the password is right, so they reveal nothing about other accounts.
            if ($user->type !== UserType::ADMIN->value) {
                throw new UnauthorizedException(__('exceptions.only_admin'), null, 403);
            }

            if (!$user->active) {
                throw new UnauthorizedException(__('exceptions.account_inactive'), null, 403);
            }

            $token = $this->createToken($user);

            return [
                "user" => $user,
                "token" => $token['token'],
                "refreshToken" => $token['refreshToken']
            ];

        }
        throw new UnauthorizedException(__('exceptions.email_password_invalid'), null, 401);
    }


    public function createToken(User $user, $name = 'API Token'): array
    {
        $accessToken = $user->createToken($name);

        $refreshToken = $this->createRefreshToken($accessToken->token);

        return [
            'token' => $accessToken->accessToken,
            'refreshToken' => $refreshToken,
        ];
    }

    public function createRefreshToken($accessToken): string
    {
        $refreshToken = new RefreshToken();
        $refreshToken->id = (string) Str::uuid();
        $refreshToken->access_token_id = $accessToken->id;
        $refreshToken->revoked = false;
        $refreshToken->expires_at = now()->addDays(30);
        $refreshToken->save();

        return $refreshToken->id;
    }

    /**
     * Rotate an access/refresh pair. The refresh token alone is the credential
     * (route is not behind auth:api). Concurrent callers with the same token
     * share one rotation via a lock; within 30s the revoked token still returns
     * the same new pair so parallel tabs/requests do not race into 401s.
     *
     * @throws AuthenticationException
     */
    public function refreshToken(string $refreshToken): array
    {
        $resultCacheKey = "auth:refresh:result:{$refreshToken}";

        $cached = Cache::get($resultCacheKey);
        if ($this->isTokenPair($cached)) {
            return $cached;
        }

        return Cache::lock("auth:refresh:{$refreshToken}", 10)->block(5, function () use ($refreshToken, $resultCacheKey) {
            $cached = Cache::get($resultCacheKey);
            if ($this->isTokenPair($cached)) {
                return $cached;
            }

            return DB::transaction(function () use ($refreshToken, $resultCacheKey) {
                $refreshTokenRecord = RefreshToken::where('id', $refreshToken)->lockForUpdate()->first();

                if (!$refreshTokenRecord || $refreshTokenRecord->revoked) {
                    throw new AuthenticationException(__('Invalid or expired refresh token.'));
                }

                if ($refreshTokenRecord->expires_at && $refreshTokenRecord->expires_at->isPast()) {
                    throw new AuthenticationException(__('Invalid or expired refresh token.'));
                }

                $accessToken = Token::where('id', $refreshTokenRecord->access_token_id)->lockForUpdate()->first();

                if (!$accessToken || $accessToken->revoked) {
                    throw new AuthenticationException(__('Invalid access token.'));
                }

                $user = User::find($accessToken->user_id);

                // A refresh is a new sign-in, held to the same account rules as login().
                if (!$user || !$user->active || $user->type !== UserType::ADMIN->value) {
                    throw new AuthenticationException(__('Invalid or expired refresh token.'));
                }

                $accessToken->revoke();
                $refreshTokenRecord->revoke();

                $newAccessToken = $user->createToken('API Token');
                $newAccessTokenId = $newAccessToken->token->id;

                $newRefreshToken = new RefreshToken();
                $newRefreshToken->id = (string) Str::uuid();
                $newRefreshToken->access_token_id = $newAccessTokenId;
                $newRefreshToken->revoked = false;
                $newRefreshToken->expires_at = now()->addDays(30);
                $newRefreshToken->save();

                $pair = [
                    'token' => $newAccessToken->accessToken,
                    'refreshToken' => $newRefreshToken->id,
                ];

                Cache::put($resultCacheKey, $pair, 30);

                return $pair;
            });
        });
    }

    /**
     * @param mixed $value
     */
    private function isTokenPair($value): bool
    {
        return is_array($value)
            && isset($value['token'], $value['refreshToken'])
            && is_string($value['token'])
            && is_string($value['refreshToken']);
    }


    public function me(): User
    {
        $user = auth()->user();

        $user->load('roles.permissions');

        $transformedRoles = $user->roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        $user->setRelation('transformedRoles', $transformedRoles);

        return $user;
    }

    public function getMyRoles($user)
    {
        $roles = $user->roles()->with('permissions')->get();

        return $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permission' => $role->permissions->pluck('name'),
            ];
        });
    }

    public function findUserByEmail($email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function checkAccountStatus($user): bool
    {
        return $user && $user->active;
    }

    public function logout($user): string
    {
        $user->token()->revoke();

        return __('validation.logout');
    }
}
