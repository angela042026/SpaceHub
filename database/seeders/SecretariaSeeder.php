<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Secretaria;
use App\Models\Setor;

class SecretariaSeeder extends Seeder
{
    /**
     * Executa o seeder das secretárias.
     */
    public function run(): void
    {
        $osc = Setor::where('codigo', 'OSC')->firstOrFail();
        $osn = Setor::where('codigo', 'OSN')->firstOrFail();
        $pb = Setor::where('codigo', 'PB')->firstOrFail();

        // Open Space Central (34 lugares)
        for ($i = 1; $i <= 34; $i++) {

            Secretaria::updateOrCreate(
                [
                    'setor_id' => $osc->id,
                    'codigo' => 'OSC' . str_pad($i, 3, '0', STR_PAD_LEFT),
                ],
                [
                    'monitor' => true,
                    'dock_usb' => true,
                    'junto_janela' => false,
                    'ergonomica' => true,
                    'reservavel' => true,
                    'ativo' => true,
                ]
            );
        }

        // Open Space Norte (15 lugares)
        for ($i = 1; $i <= 15; $i++) {

            Secretaria::updateOrCreate(
                [
                    'setor_id' => $osn->id,
                    'codigo' => 'OSN' . str_pad($i, 3, '0', STR_PAD_LEFT),
                ],
                [
                    'monitor' => true,
                    'dock_usb' => true,
                    'junto_janela' => true,
                    'ergonomica' => true,
                    'reservavel' => true,
                    'ativo' => true,
                ]
            );
        }

        // Phone Booths (10 cabines)
        for ($i = 1; $i <= 10; $i++) {

            Secretaria::updateOrCreate(
                [
                    'setor_id' => $pb->id,
                    'codigo' => 'PB' . str_pad($i, 3, '0', STR_PAD_LEFT),
                ],
                [
                    'monitor' => false,
                    'dock_usb' => false,
                    'junto_janela' => false,
                    'ergonomica' => true,
                    'reservavel' => true,
                    'ativo' => true,
                ]
            );
        }
    }
}