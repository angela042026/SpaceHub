<?php

namespace Database\Seeders;

use App\Models\EstadoReserva;
use Illuminate\Database\Seeder;

class EstadoReservaSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            [
                'codigo' => 'pendente',
                'nome' => 'Pendente',
            ],
            [
                'codigo' => 'confirmada',
                'nome' => 'Confirmada',
            ],
            [
                'codigo' => 'cancelada',
                'nome' => 'Cancelada',
            ],
            [
                'codigo' => 'expirada',
                'nome' => 'Expirada',
            ],
            [
                'codigo' => 'concluida',
                'nome' => 'Concluída',
            ],
            [
                'codigo' => 'nao_compareceu',
                'nome' => 'Não compareceu',
            ],
        ];

        foreach ($estados as $estado) {
            EstadoReserva::updateOrCreate(
                ['codigo' => $estado['codigo']],
                $estado
            );
        }
    }
}