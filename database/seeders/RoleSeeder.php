<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(
            ['nome' => 'Administrador'],
            ['descricao' => 'Acesso total ao sistema']
        );

        Role::updateOrCreate(
            ['nome' => 'Gestor'],
            ['descricao' => 'Gere localidades, pisos, setores e secretárias']
        );

        Role::updateOrCreate(
            ['nome' => 'Colaborador'],
            ['descricao' => 'Apoio operacional, manutenção e limpeza']
        );

        Role::updateOrCreate(
            ['nome' => 'Utilizador'],
            ['descricao' => 'Reserva secretárias e faz check-in']
        );
    }
}