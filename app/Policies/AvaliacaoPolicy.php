<?php

namespace App\Policies;

use App\Models\Avaliacao;
use App\Models\User;

class AvaliacaoPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if (! $user->ativo) {
            return false;
        }

        if ($user->isAdministrador()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isGestor();
    }

    public function moderar(User $user, Avaliacao $avaliacao): bool
    {
        return $user->isGestor();
    }
}
