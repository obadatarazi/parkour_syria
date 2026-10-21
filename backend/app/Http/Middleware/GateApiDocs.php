<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The Swagger UI and spec map every admin route. They are open on a developer's machine, behind
 * HTTP basic auth where L5_SWAGGER_USER / L5_SWAGGER_PASSWORD are set, and absent everywhere else.
 */
class GateApiDocs
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('local') || config('l5-swagger.access.public')) {
            return $next($request);
        }

        $user = (string) config('l5-swagger.access.user');
        $password = (string) config('l5-swagger.access.password');

        abort_if($user === '' || $password === '', 404);

        $granted = hash_equals($user, (string) $request->getUser())
            && hash_equals($password, (string) $request->getPassword());

        if (!$granted) {
            return response('', 401, ['WWW-Authenticate' => 'Basic realm="API documentation"']);
        }

        return $next($request);
    }
}
