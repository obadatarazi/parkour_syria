<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\ForgotPasswordRequest;
use App\Http\Requests\Admin\ResetPasswordRequest;
use App\Services\PasswordResetService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Self-service password reset for dashboard accounts. Both routes are public and rate limited.
 */
class AdminPasswordResetController extends ApiController
{
    public function __construct(protected PasswordResetService $passwordResetService) {}

    #[OA\Post(
        path: '/api/admin/me/password/forgot',
        description: 'Emails a reset link when the address belongs to an active dashboard account. '
            .'The answer is the same whether or not it does.',
        summary: 'request a password reset link',
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'email', type: 'string', example: 'admin@parkoursyria.com'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Request taken'),
            new OA\Response(response: 422, description: 'Invalid email'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->sendResetLink($request->validated()['email']);

        return $this->successResponse(__('passwords.sent'));
    }

    #[OA\Post(
        path: '/api/admin/me/password/reset',
        description: 'Sets a new password with the token from the reset email, and signs the account out everywhere.',
        summary: 'reset a password',
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'email', type: 'string', example: 'admin@parkoursyria.com'),
                        new OA\Property(property: 'token', type: 'string', example: 'token-from-the-email'),
                        new OA\Property(property: 'password', type: 'string', example: 'NewPassw0rd'),
                        new OA\Property(property: 'passwordConfirmation', type: 'string', example: 'NewPassw0rd'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Password reset'),
            new OA\Response(response: 422, description: 'Invalid or expired link, or a weak password'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! $this->passwordResetService->reset($data['email'], $data['token'], $data['password'])) {
            return $this->errorResponse(__('passwords.token'), 422);
        }

        return $this->successResponse(__('passwords.reset'));
    }
}
