<?php

namespace App\Policies;

use App\Models\Reserva;
use App\Models\User;

class ReservaPolicy
{
    /**
     * Bloqueia qualquer operação de utilizadores inativos.
     */
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->ativo) {
            return false;
        }

        return null;
    }

    /**
     * Todos os utilizadores autenticados podem listar reservas.
     *
     * O controller garante que apenas o Administrador recebe todas.
     * Os restantes recebem apenas as próprias reservas.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * O Administrador consulta qualquer reserva.
     * Os restantes consultam apenas as próprias.
     */
    public function view(User $user, Reserva $reserva): bool
    {
        return $this->isAdministrador($user)
            || $reserva->user_id === $user->id;
    }

    /**
     * Todos os utilizadores autenticados podem criar reservas próprias.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * O Administrador atualiza qualquer reserva.
     * Os restantes atualizam apenas as próprias.
     */
    public function update(User $user, Reserva $reserva): bool
    {
        return $this->isAdministrador($user)
            || $reserva->user_id === $user->id;
    }

    /**
     * O Administrador cancela qualquer reserva.
     * Os restantes cancelam apenas as próprias.
     */
    public function cancelar(User $user, Reserva $reserva): bool
    {
        return $this->isAdministrador($user)
            || $reserva->user_id === $user->id;
    }

    /**
     * Não existe eliminação direta de reservas na API.
     */
    public function delete(User $user, Reserva $reserva): bool
    {
        return false;
    }

    private function isAdministrador(User $user): bool
    {
        return $user->role?->nome === 'Administrador';
    }
}