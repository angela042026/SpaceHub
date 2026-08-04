<?php

namespace App\Enums;

/**
 * Nomes fixos dos 4 papéis existentes (tabela `roles`). Existe para
 * eliminar a comparação de strings soltas ('Administrador', 'Gestor', ...)
 * repetida em Policies, Middleware e Requests — um erro de escrita num
 * desses sítios passava a comparação a dar sempre false, silenciosamente.
 */
enum RoleName: string
{
    case Administrador = 'Administrador';
    case Gestor = 'Gestor';
    case Colaborador = 'Colaborador';
    case Utilizador = 'Utilizador';
}
