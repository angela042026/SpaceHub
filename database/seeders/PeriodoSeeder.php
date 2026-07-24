<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Periodo;

class PeriodoSeeder extends Seeder
{
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