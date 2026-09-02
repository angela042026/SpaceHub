<?php

namespace Database\Seeders;

use App\Models\Edificio;
use App\Models\Piso;
use Illuminate\Database\Seeder;

class PisoSeeder extends Seeder
{
    /**
     * Executa o seeder dos pisos.
     */
    public function run(): void
    {
        // Obtém o edifício principal
        $edificio = Edificio::where('codigo', 'SHB')->first();

        // Cria ou atualiza o Piso 0
        Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P0',
            ],
            [
                'nome' => 'Piso 0',
                'numero' => 0,
                'planta' => 'piso0.png',
                'descricao' => 'Zona de coworking, receção e salas de reunião.',
                'ativo' => true,
            ]
        );

        // Cria ou atualiza o Piso 1
        Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P1',
            ],
            [
                'nome' => 'Piso 1',
                'numero' => 1,
                'planta' => 'piso1.png',
                'descricao' => 'Escritórios privados e salas de reunião.',
                'ativo' => true,
            ]
        );

        // Cria ou atualiza o Piso 2
        Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P2',
            ],
            [
                'nome' => 'Piso 2',
                'numero' => 2,
                'planta' => 'piso2.png',
                'descricao' => 'Escritórios premium, salas criativas e terraço.',
                'ativo' => true,
            ]
        );
    }
}
