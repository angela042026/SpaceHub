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

    // =====================================================
    // PISO 0
    // =====================================================

    [
        'piso_id' => $piso0->id,
        'codigo' => 'OSC',
        'nome' => 'Open Space Central',
        'tipo' => 'open_space',
        'reservavel' => true,
        'capacidade' => 34,
    ],

    [
        'piso_id' => $piso0->id,
        'codigo' => 'OSN',
        'nome' => 'Open Space Norte',
        'tipo' => 'open_space',
        'reservavel' => true,
        'capacidade' => 14,
    ],

    [
        'piso_id' => $piso0->id,
        'codigo' => 'PB',
        'nome' => 'Phone Booth',
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
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso0->id,
        'codigo' => 'LOU',
        'nome' => 'Lounge',
        'tipo' => 'lounge',
        'reservavel' => false,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso0->id,
        'codigo' => 'COP',
        'nome' => 'Copa',
        'tipo' => 'copa',
        'reservavel' => false,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso0->id,
        'codigo' => 'WC',
        'nome' => 'Instalações Sanitárias',
        'tipo' => 'wc',
        'reservavel' => false,
        'capacidade' => 2,
    ],

    // =====================================================
    // PISO 1
    // =====================================================

    [
        'piso_id' => $piso1->id,
        'codigo' => 'E',
        'nome' => 'Escritório',
        'tipo' => 'escritorio',
        'reservavel' => true,
        'capacidade' => 5,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'SRG',
        'nome' => 'Sala de Reuniões Grande',
        'tipo' => 'sala_reunioes',
        'reservavel' => true,
        'capacidade' => 2,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'SRM',
        'nome' => 'Sala de Reuniões Média',
        'tipo' => 'sala_reunioes',
        'reservavel' => true,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'SRR',
        'nome' => 'Sala de Reuniões Redonda',
        'tipo' => 'sala_reunioes',
        'reservavel' => true,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'PB',
        'nome' => 'Phone Booth',
        'tipo' => 'phone_booth',
        'reservavel' => true,
        'capacidade' => 5,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'COP',
        'nome' => 'Copa',
        'tipo' => 'copa',
        'reservavel' => false,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso1->id,
        'codigo' => 'SE',
        'nome' => 'Sala de Espera',
        'tipo' => 'sala_espera',
        'reservavel' => false,
        'capacidade' => 1,
    ],

    // =====================================================
    // PISO 2
    // =====================================================

    [
        'piso_id' => $piso2->id,
        'codigo' => 'EE',
        'nome' => 'Escritório Executivo',
        'tipo' => 'escritorio_executivo',
        'reservavel' => true,
        'capacidade' => 7,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'SRE',
        'nome' => 'Sala de Reuniões Executiva',
        'tipo' => 'sala_reunioes',
        'reservavel' => true,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'SCR',
        'nome' => 'Sala Criativa',
        'tipo' => 'sala_criativa',
        'reservavel' => true,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'PB',
        'nome' => 'Phone Booth',
        'tipo' => 'phone_booth',
        'reservavel' => true,
        'capacidade' => 2,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'SE',
        'nome' => 'Sala de Espera',
        'tipo' => 'sala_espera',
        'reservavel' => false,
        'capacidade' => 1,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'COP',
        'nome' => 'Copa',
        'tipo' => 'copa',
        'reservavel' => false,
        'capacidade' => 2,
    ],

    [
        'piso_id' => $piso2->id,
        'codigo' => 'WC',
        'nome' => 'Instalações Sanitárias',
        'tipo' => 'wc',
        'reservavel' => false,
        'capacidade' => 4,
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
