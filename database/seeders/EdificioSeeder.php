<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Edificio;

class EdificioSeeder extends Seeder
{
    public function run(): void
    {
        Edificio::updateOrCreate(
            ['codigo' => 'SHB'],
            [
                'nome' => 'Space Hub Braga',
                'morada' => 'Rua do Space Hub, nº 100',
                'codigo_postal' => '4700-000',
                'cidade' => 'Braga',
                'pais' => 'Portugal',
                'telefone' => '253 000 000',
                'email' => 'geral@spacehub.pt',
                'imagem' => null,
                'hora_abertura' => '08:00:00',
                'hora_fecho' => '20:00:00',
                'ativo' => true,
                'descricao' => 'Edifício principal do Space Hub.',
            ]
        );
    }
}