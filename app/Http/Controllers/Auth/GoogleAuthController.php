<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $googleId = $googleUser->getId();
            $email = $googleUser->getEmail();

            if (!$email) {
                return redirect()
                    ->route('login')
                    ->withErrors([
                        'email' => 'O Google não forneceu um endereço de e-mail.',
                    ]);
            }

            // Vincular sempre pelo identificador do Google, nunca só pelo
            // e-mail: isso evita que uma conta pré-registada por senha com
            // o e-mail de outra pessoa "sequestre" o login Google dela.
            $user = User::query()
                ->where('google_id', $googleId)
                ->first();

            if (!$user) {
                $user = User::query()
                    ->where('email', $email)
                    ->first();
            }

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?: 'Utilizador Google',
                    'email' => $email,
                    'google_id' => $googleId,
                    'email_verified_at' => now(),
                    'password' => Str::random(40),
                    'ativo' => true,
                ]);
            } else {
                if (! $user->ativo) {
                    return redirect()
                        ->route('login')
                        ->withErrors([
                            'email' => 'Esta conta encontra-se desativada. Contacte um administrador.',
                        ]);
                }

                $atributos = ['google_id' => $googleId];

                // O e-mail desta conta nunca foi confirmado, ou seja, pode
                // ter sido registada por outra pessoa. O Google agora prova
                // que quem está a autenticar é o verdadeiro dono do e-mail,
                // por isso reivindicamos a conta e invalidamos qualquer
                // senha que possa já ter sido definida por terceiros.
                if ($user->email_verified_at === null) {
                    $atributos['email_verified_at'] = now();
                    $atributos['password'] = Str::random(40);
                }

                $user->forceFill($atributos)->save();
            }

            Auth::login($user, true);

            request()->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        } catch (Throwable $exception) {
            report($exception);

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Não foi possível iniciar sessão com o Google. Tente novamente.',
                ]);
        }
    }
}
