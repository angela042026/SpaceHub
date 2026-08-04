<?php

namespace App\Policies;

use App\Models\Setor;
use App\Models\User;

class SetorPolicy
{
    public function before(User $user, string $ability): bool|null
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

    public function view(User $user, Setor $setor): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isGestor();
    }

    public function update(User $user, Setor $setor): bool
    {
        return $user->isGestor();
    }

    public function toggleAtivo(User $user, Setor $setor): bool
    {
        return $user->isGestor();
    }
}
