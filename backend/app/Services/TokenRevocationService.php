<?php

namespace App\Services;

use App\Models\User;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

/**
 * Ends a user's sessions: every access token they hold and the refresh token paired with each one,
 * so a stolen or stale session cannot be refreshed back to life.
 */
class TokenRevocationService
{
    /**
     * @param string|null $keepTokenId An access token to leave alone, the session the user is
     *                                 changing their own password from.
     */
    public function revokeAll(User $user, ?string $keepTokenId = null): void
    {
        $tokenIds = Token::query()
            ->where('user_id', $user->getKey())
            ->where('revoked', false)
            ->when($keepTokenId !== null, fn ($query) => $query->whereKeyNot($keepTokenId))
            ->pluck('id');

        if ($tokenIds->isEmpty()) {
            return;
        }

        Token::query()->whereIn('id', $tokenIds)->update(['revoked' => true]);
        RefreshToken::query()->whereIn('access_token_id', $tokenIds)->update(['revoked' => true]);
    }
}
