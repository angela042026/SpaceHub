<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $request->user()?->loadMissing('role'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notificacoesReais' => fn () => $request->user()
                ? $request->user()->notifications()
                    ->latest()
                    ->limit(20)
                    ->get()
                    ->map(fn ($notificacao) => [
                        'id' => $notificacao->id,
                        'tipo' => $notificacao->data['tipo'] ?? null,
                        'titulo' => $notificacao->data['titulo'] ?? null,
                        'mensagem' => $notificacao->data['mensagem'] ?? null,
                        'lida' => $notificacao->read_at !== null,
                    ])
                : [],
        ];
    }
}
