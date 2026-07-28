<?php

namespace App\Policies;

use App\Models\Avaliacao;
use App\Models\User;

class AvaliacaoPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->ativo) {
            return false;
        }

        if ($user->role?->nome === 'Administrador') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $this->isGestor($user);
    }

    public function moderar(User $user, Avaliacao $avaliacao): bool
    {
        return $this->isGestor($user);
    }

    private function isGestor(User $user): bool
    {
        return $user->role?->nome === 'Gestor';
    }
}
