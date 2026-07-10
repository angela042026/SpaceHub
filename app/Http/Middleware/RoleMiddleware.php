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
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        // Verifica se existe utilizador autenticado
        if (!$user) {
            return response()->json([
                'message' => 'Utilizador não autenticado.'
            ], 401);
        }

        // Verifica se o utilizador tem o papel pretendido
        if (!$user->role || $user->role->nome !== $role) {
            return response()->json([
                'message' => 'Não tem permissão para aceder a este recurso.'
            ], 403);
        }

        return $next($request);
    }
}