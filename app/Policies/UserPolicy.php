<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Apenas o Administrador pode listar utilizadores.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdministrador();
    }

    /**
     * Apenas o Administrador pode consultar utilizadores
     * através do CRUD administrativo.
     */
    public function view(User $user, User $targetUser): bool
    {
        return $user->isAdministrador();
    }

    /**
     * Apenas o Administrador pode criar utilizadores.
     */
    public function create(User $user): bool
    {
        return $user->isAdministrador();
    }

    /**
     * Apenas o Administrador pode atualizar utilizadores
     * através do CRUD administrativo.
     */
    public function update(User $user, User $targetUser): bool
    {
        return $user->isAdministrador();
    }

    /**
     * Apenas o Administrador pode ativar ou desativar outro utilizador.
     * Um Administrador não pode desativar a própria conta.
     */
    public function toggleAtivo(User $user, User $targetUser): bool
    {
        return $user->isAdministrador()
            && ! $user->is($targetUser);
    }

    /**
     * Os utilizadores nunca são eliminados.
     */
    public function delete(User $user, User $targetUser): bool
    {
        return false;
    }
}
