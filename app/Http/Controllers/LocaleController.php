<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Troca o idioma da aplicação. Acessível a visitantes e a
     * utilizadores autenticados — o idioma é uma preferência de
     * apresentação, não uma ação que exija sessão iniciada.
     */
    public function update(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'locale' => ['required', 'string', 'in:' . implode(',', SetLocale::LOCALES_SUPORTADOS)],
        ]);

        $request->session()->put('locale', $dados['locale']);

        return back()->withCookie(
            cookie(SetLocale::COOKIE, $dados['locale'], 60 * 24 * 365)
        );
    }
}
