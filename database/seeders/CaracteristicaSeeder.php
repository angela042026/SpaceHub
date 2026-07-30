<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Caracteristica;

class CaracteristicaSeeder extends Seeder
{
    public function run(): void
    {
        $caracteristicas = [
            'Monitor',
            'Dock USB',
            'HDMI',
            'Cadeira Ergonómica',
            'Janela',
            'Luz Natural',
            'Zona Silenciosa',
            'Junto à Copa',
        ];

        foreach ($caracteristicas as $nome) {
            Caracteristica::firstOrCreate([
                'nome' => $nome,
            ]);
        }
    }
}