<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Utilizador não autenticado.',
            ], 401);
        }

        if (! $user->ativo) {
            return response()->json([
                'message' => 'A conta encontra-se desativada.',
            ], 403);
        }

        return $next($request);
    }
}