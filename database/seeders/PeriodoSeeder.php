<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Periodo;

class PeriodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Periodo::create([
            'nome' => 'Manhã',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '13:00:00',
            'ativo' => true,
        ]);

        Periodo::create([
            'nome' => 'Tarde',
            'hora_inicio' => '13:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
    }
}