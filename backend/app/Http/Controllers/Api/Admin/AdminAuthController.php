<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\SerializedGroup;
use App\Exceptions\Custom\UnauthorizedException;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\ChangePasswordRequest;
use App\Http\Requests\Admin\LoginRequest;
use App\Http\Requests\Admin\RefreshTokenRequest;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\UserService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AdminAuthController extends ApiController
{
    public function __construct(
        protected AuthService $authService,
        protected UserService $userService,
    ) {}

    #[OA\Post(
        path: '/api/admin/auth/login',
        description: '',
        summary: 'login admin',
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'email', type: 'string', example: 'admin@parkoursyria.com'),
                        new OA\Property(property: 'password', type: 'string', example: 'password'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login Success',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'token', type: 'string', example: 'access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Unknown email, wrong password and non-admin account answer alike until the password
            // is right; AuthService::login() checks the account type after that.
            $data = $this->authService->login($request->validated());

            return $this
                ->setSerializedGroup(SerializedGroup::Details->value)
                ->successResponse([
                    'user' => new UserResource($data['user']),
                    'token' => $data['token'],
                    'refreshToken' => $data['refreshToken'],
                ]);
        } catch (UnauthorizedException $ex) {

            throw new UnauthorizedHttpException($ex->getMessage(), $ex->getMessage());
        }
    }

    #[OA\Post(
        path: '/api/admin/auth/refresh-token',
        description: '',
        summary: 'refresh token admin',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'refreshToken', type: 'string', example: 'your_refresh_token'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Refresh Token Success',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'refreshToken', type: 'string', example: 'your_refresh_access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function refreshToken(RefreshTokenRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->refreshToken($request->validated()['refresh_token']);

            return $this->successResponse($data);
        } catch (AuthenticationException $e) {
            throw new UnauthorizedHttpException($e->getMessage(), $e->getMessage());
        }
    }

    #[OA\Get(
        path: '/api/admin/auth/account/status',
        description: 'Check Your Account Admin Is Active Or In Active',
        summary: 'Check Your Account Admin Is Active Or In Active',
        security: [['Bearer' => []]],
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User Contractor Register Account Success',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'token', type: 'string', example: 'access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function getAccountStatus(): JsonResponse
    {
        $user = auth()->user();

        $isActive = $this->authService->checkAccountStatus($user);

        return $this
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse([
                'status' => $isActive,
                'message' => $isActive ? 'Your Account is Active.' : 'Your Account is Inactive. Please Contact Super Admin For Support And Assistance.',
            ]);
    }

    #[OA\Get(
        path: '/api/admin/auth/logout',
        description: 'Logout Admin Account',
        summary: 'Logout Admin Account',
        security: [['Bearer' => []]],
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout Account',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'token', type: 'string', example: 'access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function logout(): JsonResponse
    {
        $user = auth()->user();

        $logout = $this->authService->logout($user);

        return $this
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($logout);
    }

    #[OA\Get(
        path: '/api/admin/me/profile',
        description: 'get profile',
        summary: 'Get admin profile',
        security: [['Bearer' => []]],
        tags: ['Admin Auth'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Returns Profile User',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                        ]
                    )
                )
            ),
        ]
    )]
    public function me(): JsonResponse
    {
        $data = $this->authService->me();

        return $this
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse([
                'user' => new UserResource($data),
            ]);
    }

    #[OA\Post(
        path: '/api/admin/me/profile/update',
        description: '',
        summary: 'update admin profile',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: '_method', type: 'text', example: 'PUT'),
                        new OA\Property(property: 'avatar', type: 'file'),
                        new OA\Property(property: 'fullName', type: 'string', example: 'full name super user admin'),
                        new OA\Property(property: 'email', type: 'string', example: 'user@email.com'),
                        new OA\Property(property: 'gender', type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE'),
                        new OA\Property(property: 'dateOfBirth', type: 'string', example: '2024-07-03'),
                        new OA\Property(property: 'phoneNumber', type: 'string', example: '0922222222'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Update Profile Admin Success',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'token', type: 'string', example: 'access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function updateProfileAdmin(UpdateProfileRequest $updateProfileRequest): JsonResponse
    {
        $user = auth()->user();

        $payload = $updateProfileRequest->validated();

        $data = $this->userService->updateProfile($payload, $user);

        return $this
            ->setResourceClass(UserResource::class)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($data, 201);
    }

    #[OA\Get(
        path: '/api/admin/me/roles',
        description: 'get my roles',
        summary: 'Get admin my roles',
        security: [['Bearer' => []]],
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Returns My Roles User',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(
                                property: 'data',
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 1),
                                    new OA\Property(property: 'name', type: 'string', example: 'super-admin'),
                                    new OA\Property(
                                        property: 'permission',
                                        type: 'array',
                                        items: new OA\Items(type: 'string', example: 'MANAGE_USER')
                                    ),
                                ],
                                type: 'object'
                            ),
                        ]
                    )
                )
            ),
        ]
    )]
    public function getMyRoles(): JsonResponse
    {
        $user = Auth::user();

        $roles = $this->authService->getMyRoles($user);

        return $this->successResponse($roles);
    }

    #[OA\Post(
        path: '/api/admin/me/password/change',
        description: 'admin change password',
        summary: 'admin change password',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'currentPassword', type: 'string', example: 'test12345'),
                        new OA\Property(property: 'newPassword', type: 'string', example: 'test123456'),
                        new OA\Property(property: 'newPasswordConfirmation', type: 'string', example: 'test123456'),
                    ]
                )
            )
        ),
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Admin User Change Password Success',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                            new OA\Property(property: 'token', type: 'string', example: 'access_token'),
                        ]
                    )
                )
            ),
        ]
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    public function changePassword(ChangePasswordRequest $changePasswordRequest): JsonResponse
    {
        $user = auth()->user();

        $changePassword = $this->userService->changePassword($changePasswordRequest->validated(), $user);

        return $this->successResponse($changePassword);
    }
}
