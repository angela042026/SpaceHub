<?php

namespace App\Http\Middleware;

use App\Enums\RoleName;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Os nomes de role vêm da definição da rota (ex.: `role:Administrador,Gestor`)
     * como strings — RoleName::from() converte-os e recusa a app arrancar
     * se algum deles não corresponder a um caso válido do enum, em vez
     * de silenciosamente nunca autorizar ninguém por causa de um erro
     * de escrita na rota.
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
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Utilizador inativo.',
                ], 403);
            }

            abort(403, 'Utilizador inativo.');
        }

        $rolesPermitidas = array_map(
            fn (string $role) => RoleName::from($role),
            $roles
        );

        $temPermissao = collect($rolesPermitidas)
            ->contains(fn (RoleName $role) => $user->hasRole($role));

        if (! $temPermissao) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Não tem permissão para aceder a este recurso.',
                ], 403);
            }

            abort(403, 'Não tem permissão para aceder a este recurso.');
        }

        return $next($request);
    }
}