<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Utilizador não autenticado.',
            ], 401);
        }

        if (! $user->ativo) {
            return response()->json([
                'message' => 'Utilizador inativo.',
            ], 403);
        }

        if (
            ! $user->role ||
            ! in_array($user->role->nome, $roles, true)
        ) {
            return response()->json([
                'message' => 'Não tem permissão para aceder a este recurso.',
            ], 403);
        }

        return $next($request);
    }
}