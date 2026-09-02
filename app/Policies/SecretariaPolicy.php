<?php

namespace App\Policies;

use App\Models\Secretaria;
use App\Models\User;

class SecretariaPolicy
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
        return true;
    }

    public function view(User $user, Secretaria $secretaria): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isGestor();
    }

    public function update(
        User $user,
        Secretaria $secretaria
    ): bool {
        return $user->isGestor();
    }

    public function toggleAtivo(
        User $user,
        Secretaria $secretaria
    ): bool {
        return $user->isGestor();
    }
}
