<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Apenas o Administrador pode consultar ou exportar o Registo de
     * Atividade — o mesmo critério de UserPolicy::viewAny(), já que este
     * registo pode conter dados sensíveis sobre outros utilizadores.
     * Usada tanto para AtividadeController::index() como ::export().
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdministrador();
    }
}
