<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const LOCALES_SUPORTADOS = ['pt', 'en'];

    public const COOKIE = 'locale';

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale')
            ?? $request->cookie(self::COOKIE);

        if (! in_array($locale, self::LOCALES_SUPORTADOS, true)) {
            $locale = 'pt';
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        return $next($request);
    }
}
