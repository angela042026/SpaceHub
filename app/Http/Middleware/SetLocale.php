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

    public const LOCALE_OMISSAO = 'pt';

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sessão e cookie vêm sempre primeiro — são a escolha mais
        // recente, feita explicitamente através do seletor de idioma
        // (LocaleController), mesmo que divirja da preferência guardada
        // no utilizador. Só se nenhuma delas existir (ex.: login num
        // browser/dispositivo novo, sem sessão nem cookie anteriores) é
        // que se recorre à preferência gravada em User::locale.
        $locale = $request->session()->get('locale')
            ?? $request->cookie(self::COOKIE)
            ?? $request->user()?->locale;

        if (! in_array($locale, self::LOCALES_SUPORTADOS, true)) {
            $locale = self::LOCALE_OMISSAO;
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        return $next($request);
    }
}
