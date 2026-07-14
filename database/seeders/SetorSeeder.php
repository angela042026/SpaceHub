<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Piso;
use App\Models\Setor;

class SetorSeeder extends Seeder
{
    /**
     * Executa o seeder dos setores.
     */
    public function run(): void
    {
        // Obtém os pisos
        $piso0 = Piso::where('codigo', 'P0')->firstOrFail();
        $piso1 = Piso::where('codigo', 'P1')->firstOrFail();
        $piso2 = Piso::where('codigo', 'P2')->firstOrFail();

        // Lista de setores
        $setores = [

            // ==========================
            // Piso 0
            // ==========================
            [
                'piso_id' => $piso0->id,
                'codigo' => 'OSC',
                'nome' => 'Open Space Central',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 34,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'OSN',
                'nome' => 'Open Space Norte',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 14,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'PB',
                'nome' => 'Phone Booths',
                'tipo' => 'phone_booth',
                'reservavel' => true,
                'capacidade' => 10,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'REC',
                'nome' => 'Receção',
                'tipo' => 'rececao',
                'reservavel' => false,
                'capacidade' => null,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'LOU',
                'nome' => 'Lounge',
                'tipo' => 'lounge',
                'reservavel' => false,
                'capacidade' => null,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'COP',
                'nome' => 'Copa',
                'tipo' => 'cafetaria',
                'reservavel' => false,
                'capacidade' => null,
            ],
            [
                'piso_id' => $piso0->id,
                'codigo' => 'WC',
                'nome' => 'Instalações Sanitárias',
                'tipo' => 'sanitario',
                'reservavel' => false,
                'capacidade' => null,
            ],

            // ==========================
            // Piso 1
            // ==========================
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E01',
                'nome' => 'Escritório 1',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E02',
                'nome' => 'Escritório 2',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E03',
                'nome' => 'Escritório 3',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E04',
                'nome' => 'Escritório 4',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E05',
                'nome' => 'Escritório 5',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],
            [
                'piso_id' => $piso1->id,
                'codigo' => 'E06',
                'nome' => 'Escritório 6',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 4,
            ],

            // ==========================
            // Piso 2
            // ==========================
            [
                'piso_id' => $piso2->id,
                'codigo' => 'EP1',
                'nome' => 'Escritório Premium 1',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 6,
            ],
            [
                'piso_id' => $piso2->id,
                'codigo' => 'EP2',
                'nome' => 'Escritório Premium 2',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 6,
            ],
            [
                'piso_id' => $piso2->id,
                'codigo' => 'EP3',
                'nome' => 'Escritório Premium 3',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 6,
            ],
            [
                'piso_id' => $piso2->id,
                'codigo' => 'EP4',
                'nome' => 'Escritório Premium 4',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 6,
            ],
            [
                'piso_id' => $piso2->id,
                'codigo' => 'EP5',
                'nome' => 'Escritório Premium 5',
                'tipo' => 'coworking',
                'reservavel' => true,
                'capacidade' => 6,
            ],
        ];

        // Guarda os setores na base de dados
        foreach ($setores as $setor) {
            Setor::updateOrCreate(
                [
                    'piso_id' => $setor['piso_id'],
                    'codigo' => $setor['codigo'],
                ],
                [
                    'nome' => $setor['nome'],
                    'tipo' => $setor['tipo'],
                    'reservavel' => $setor['reservavel'],
                    'capacidade' => $setor['capacidade'],
                    'descricao' => null,
                    'ativo' => true,
                ]
            );
        }
    }
}