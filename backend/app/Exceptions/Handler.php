<?php

namespace App\Exceptions;

use App\Traits\ApiResponser;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponser;

    /**
     * Expected client-auth noise (expired/revoked Bearer). Do not flood logs.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        \Laravel\Passport\Exceptions\OAuthServerException::class,
        \League\OAuth2\Server\Exception\OAuthServerException::class,
    ];

    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*')) {
            if ($exception instanceof HttpException) {
                $statusCode = $exception->getStatusCode();
            } else {
                $statusCode = 500;
                if ($exception instanceof ModelNotFoundException) {
                    return $this->errorResponse(__('exceptions.not_found'), 404);

                }
                if ($exception instanceof AuthenticationException) {
                    return $this->errorResponse(__('exceptions.unauthenticated'), 401);

                }
                if ($this->isOAuthAccessDenied($exception)) {
                    return $this->errorResponse(__('exceptions.unauthenticated'), 401);
                }
                if ($exception instanceof ValidationException) {
                    return $this->errorResponse($exception->getMessage(), 422);
                }
            }
            // An unexpected error's message carries SQL, file paths and hosts. It goes to the log
            // (report() still runs), the client only reads it while debugging.
            if ($statusCode === 500 && !config('app.debug')) {
                return $this->errorResponse(__('exceptions.server_error'), 500);
            }

            return $this->errorResponse(__($exception->getMessage()), $statusCode);

        }

        return parent::render($request, $exception);
    }

    private function isOAuthAccessDenied(Throwable $exception): bool
    {
        return $exception instanceof \Laravel\Passport\Exceptions\OAuthServerException
            || $exception instanceof \League\OAuth2\Server\Exception\OAuthServerException;
    }
}
