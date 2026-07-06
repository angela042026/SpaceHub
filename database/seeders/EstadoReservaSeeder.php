<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoReserva;

class EstadoReservaSeeder extends Seeder
{
    public function run(): void
    {
        EstadoReserva::updateOrCreate(
            ['codigo' => 'pendente'],
            [
                'nome' => 'Pendente',
                'descricao' => 'Reserva criada, mas ainda sem check-in',
            ]
        );

        EstadoReserva::updateOrCreate(
            ['codigo' => 'confirmada'],
            [
                'nome' => 'Confirmada',
                'descricao' => 'Reserva com check-in efetuado',
            ]
        );

        EstadoReserva::updateOrCreate(
            ['codigo' => 'cancelada'],
            [
                'nome' => 'Cancelada',
                'descricao' => 'Reserva cancelada pelo utilizador ou administrador',
            ]
        );

        EstadoReserva::updateOrCreate(
            ['codigo' => 'expirada'],
            [
                'nome' => 'Expirada',
                'descricao' => 'Reserva cancelada automaticamente por falta de check-in',
            ]
        );

        EstadoReserva::updateOrCreate(
            ['codigo' => 'concluida'],
            [
                'nome' => 'Concluída',
                'descricao' => 'Reserva terminada',
            ]
        );
    }
}