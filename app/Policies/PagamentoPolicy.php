<?php

namespace App\Policies;

use App\Models\Pagamento;
use App\Models\User;

class PagamentoPolicy
{
    /**
     * Permite ao administrador ignorar as restantes verificações.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->isAdministrador()) {
            return true;
        }

        return null;
    }

    /**
     * Permite listar pagamentos.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Permite consultar um pagamento.
     */
    public function view(User $user, Pagamento $pagamento): bool
    {
        return $pagamento->reserva()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Permite confirmar o pagamento.
     */
    public function confirmar(User $user, Pagamento $pagamento): bool
    {
        return $pagamento->estado === 'pendente'
            && $pagamento->reserva()
                ->where('user_id', $user->id)
                ->exists();
    }
}
