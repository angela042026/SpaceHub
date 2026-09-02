<?php

namespace Database\Seeders;

use App\Models\Secretaria;
use App\Models\Setor;
use Illuminate\Database\Seeder;

class SecretariaSeeder extends Seeder
{
    /**
     * Executa o seeder das secretárias.
     */
    public function run(): void
    {
        // Obtém todos os setores reserváveis
        $setores = Setor::where('reservavel', true)->get();

        foreach ($setores as $setor) {

            for ($i = 1; $i <= $setor->capacidade; $i++) {

                Secretaria::updateOrCreate(
                    [
                        'setor_id' => $setor->id,
                        'codigo' => $setor->codigo.str_pad($i, 2, '0', STR_PAD_LEFT),
                    ],
                    [
                        'descricao' => $setor->nome,

                        // Características do lugar
                        'monitor' => in_array($setor->tipo, [
                            'open_space',
                            'escritorio',
                            'escritorio_executivo',
                        ]),

                        'dock_usb' => in_array($setor->tipo, [
                            'open_space',
                            'escritorio',
                            'escritorio_executivo',
                        ]),

                        'junto_janela' => false,

                        'ergonomica' => $setor->tipo !== 'phone_booth',

                        'reservavel' => true,
                        'ativo' => true,
                    ]
                );

            }
        }
    }
}
