<?php

namespace Database\Seeders;

use App\Models\Periodo;
use Illuminate\Database\Seeder;

class PeriodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Periodo::updateOrCreate(
            ['nome' => 'Manhã'],
            [
                'hora_inicio' => '08:00:00',
                'hora_fim' => '13:00:00',
                'ativo' => true,
            ]
        );

        Periodo::updateOrCreate(
            ['nome' => 'Tarde'],
            [
                'hora_inicio' => '13:00:00',
                'hora_fim' => '18:00:00',
                'ativo' => true,
            ]
        );

        Periodo::updateOrCreate(
            ['nome' => 'Dia inteiro'],
            [
                'hora_inicio' => '08:00:00',
                'hora_fim' => '18:00:00',
                'ativo' => true,
            ]
        );
    }
}
