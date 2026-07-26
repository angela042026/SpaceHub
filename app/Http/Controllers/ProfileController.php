<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $dados = $request->validated();
        $fotografiaAntiga = $user->fotografia;
        $novaFotografia = null;

        if ($request->hasFile('fotografia')) {
            $novaFotografia = $request
                ->file('fotografia')
                ->store('utilizadores/fotografias', 'public');

            $dados['fotografia'] = $novaFotografia;
        }

        $user->fill($dados);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        try {
            $user->save();
        } catch (Throwable $exception) {
            if ($novaFotografia !== null) {
                Storage::disk('public')->delete($novaFotografia);
            }

            throw $exception;
        }

        if (
            $novaFotografia !== null
            && $fotografiaAntiga !== null
            && $fotografiaAntiga !== $novaFotografia
        ) {
            Storage::disk('public')->delete($fotografiaAntiga);
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
