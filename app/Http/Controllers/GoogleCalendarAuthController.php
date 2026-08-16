<?php

namespace App\Http\Controllers;

use App\Services\GoogleCalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * Autorização (independente do login) para o SpaceHub poder criar/apagar
 * eventos no Google Calendar do próprio utilizador.
 *
 * Separado do GoogleAuthController (login) de propósito: o login nunca
 * pede o scope do calendário, para não obrigar quem só quer entrar na
 * app a autorizar acesso ao calendário. Por isso usa um redirect_uri
 * próprio (tem de estar autorizado nas credenciais OAuth da Google
 * Cloud Console, tal como o do login).
 */
class GoogleCalendarAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/calendar.events'])
            ->with([
                // access_type=offline dá o refresh_token; prompt=consent
                // garante que ele vem sempre, mesmo numa reautorização
                // (o Google só o devolve à primeira vez sem isto).
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirectUrl(route('google-calendar.callback'))
            ->redirect();
    }

    public function callback(GoogleCalendarService $calendario): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl(route('google-calendar.callback'))
                ->user();

            $calendario->guardarTokens(
                Auth::user(),
                $googleUser->token,
                $googleUser->refreshToken,
                $googleUser->expiresIn ?? 3600
            );

            return Redirect::route('profile.edit')
                ->with('success', 'Google Calendar ligado com sucesso.');
        } catch (Throwable $e) {
            report($e);

            return Redirect::route('profile.edit')
                ->with('error', 'Não foi possível ligar o Google Calendar. Tenta novamente.');
        }
    }

    public function desconectar(GoogleCalendarService $calendario): RedirectResponse
    {
        $calendario->desconectar(Auth::user());

        return Redirect::route('profile.edit')
            ->with('success', 'Google Calendar desligado.');
    }
}
