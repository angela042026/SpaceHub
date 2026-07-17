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

            $email = $googleUser->getEmail();

            if (!$email) {
                return redirect()
                    ->route('login')
                    ->withErrors([
                        'email' => 'O Google não forneceu um endereço de e-mail.',
                    ]);
            }

            $user = User::query()
                ->where('email', $email)
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?: 'Utilizador Google',
                    'email' => $email,
                    'email_verified_at' => now(),
                    'password' => Str::random(40),
                    'ativo' => true,
                ]);
            } else {
                $user->forceFill([
                    'email_verified_at' => $user->email_verified_at ?: now(),
                    'ativo' => true,
                ])->save();
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
