<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Read the Accept-Language header sent by the frontend and apply it
     * as Laravel's active locale for the duration of this request.
     *
     * Only 'en' and 'fr' are accepted; everything else silently falls back
     * to the app default defined in config/app.php.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language');

        if ($locale && in_array($locale, ['en', 'fr'], strict: true)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
