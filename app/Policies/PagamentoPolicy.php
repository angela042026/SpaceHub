<?php

namespace App\Policies;

use App\Models\Pagamento;
use App\Models\User;

class PagamentoPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (!$user->ativo) {
            return false;
        }

        if ($user->role?->nome === 'Administrador') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Pagamento $pagamento): bool
    {
        return $pagamento->reserva?->user_id === $user->id;
    }

    public function confirmar(User $user, Pagamento $pagamento): bool
    {
        return $pagamento->reserva?->user_id === $user->id
            && $pagamento->estado === 'pendente';
    }
}