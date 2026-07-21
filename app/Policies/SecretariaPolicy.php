<?php

namespace App\Policies;

use App\Models\Secretaria;
use App\Models\User;

class SecretariaPolicy
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
        return true;
    }

    public function view(User $user, Secretaria $secretaria): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $this->isGestor($user);
    }

    public function update(
        User $user,
        Secretaria $secretaria
    ): bool {
        return $this->isGestor($user);
    }

    public function toggleAtivo(
        User $user,
        Secretaria $secretaria
    ): bool {
        return $this->isGestor($user);
    }

    private function isGestor(User $user): bool
    {
        return $user->role?->nome === 'Gestor';
    }
}