<?php

namespace Database\Seeders;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\Setor;
use App\Models\Secretaria;
use Illuminate\Database\Seeder;

class SpaceHubEstruturaSeeder extends Seeder
{
    public function run(): void
    {
        $edificio = Edificio::updateOrCreate(
            ['codigo' => 'SH-BRAGA'],
            [
                'nome' => 'SpaceHub Braga',
                'morada' => 'Rua do SpaceHub, 100',
                'codigo_postal' => '4700-000',
                'cidade' => 'Braga',
                'pais' => 'Portugal',
                'telefone' => '253000000',
                'email' => 'geral@spacehub.pt',
                'imagem' => null,
                'hora_abertura' => '08:00:00',
                'hora_fecho' => '20:00:00',
                'ativo' => true,
                'descricao' => 'Edifício principal do SpaceHub em Braga.',
            ]
        );

        $garagem = Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P-1',
            ],
            [
                'nome' => 'Piso -1 Garagem',
                'numero' => -1,
                'planta' => '/images/maps/Piso-1Garagem.png',
                'descricao' => 'Garagem e zonas técnicas.',
                'ativo' => true,
            ]
        );

        $piso0 = Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P0',
            ],
            [
                'nome' => 'Piso 0',
                'numero' => 0,
                'planta' => '/images/maps/Piso0.png',
                'descricao' => 'Receção, lounge, cafetaria e open space.',
                'ativo' => true,
            ]
        );

        $piso1 = Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P1',
            ],
            [
                'nome' => 'Piso 1',
                'numero' => 1,
                'planta' => '/images/maps/Piso1.png',
                'descricao' => 'Salas de reunião, escritórios e zonas de concentração.',
                'ativo' => true,
            ]
        );

        $piso2 = Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P2',
            ],
            [
                'nome' => 'Piso 2 / Terraço',
                'numero' => 2,
                'planta' => '/images/maps/Piso2Terraco.png',
                'descricao' => 'Escritórios premium, coworking exterior e terraço.',
                'ativo' => true,
            ]
        );

        $this->criarSetor($garagem, 'G-EST', 'Estacionamento', 'estacionamento', false, 20);
        $this->criarSetor($garagem, 'G-TEC', 'Zona Técnica', 'tecnico', false, 5);

        $p0Coworking = $this->criarSetor($piso0, 'P0-COW', 'Open Space', 'coworking', true, 20);
        $p0Rececao = $this->criarSetor($piso0, 'P0-REC', 'Receção', 'rececao', false, 4);
        $p0Cafe = $this->criarSetor($piso0, 'P0-CAF', 'Cafetaria', 'cafetaria', false, 20);
        $p0Lounge = $this->criarSetor($piso0, 'P0-LOU', 'Lounge', 'lounge', false, 15);
        $p0Reuniao = $this->criarSetor($piso0, 'P0-REU', 'Salas de Reunião', 'reuniao', true, 12);
        $p0Phone = $this->criarSetor($piso0, 'P0-PHO', 'Phone Booths', 'phone_booth', true, 4);

        $p1Coworking = $this->criarSetor($piso1, 'P1-COW', 'Coworking Piso 1', 'coworking', true, 24);
        $p1Reuniao = $this->criarSetor($piso1, 'P1-REU', 'Salas de Reunião Piso 1', 'reuniao', true, 18);
        $p1Concentracao = $this->criarSetor($piso1, 'P1-CON', 'Zona de Concentração', 'concentracao', true, 10);
        $p1Phone = $this->criarSetor($piso1, 'P1-PHO', 'Phone Booths Piso 1', 'phone_booth', true, 4);
        $p1Lounge = $this->criarSetor($piso1, 'P1-LOU', 'Lounge Piso 1', 'lounge', false, 15);

        $p2Coworking = $this->criarSetor($piso2, 'P2-COW', 'Coworking Premium', 'coworking', true, 26);
        $p2Reuniao = $this->criarSetor($piso2, 'P2-REU', 'Sala Executiva', 'reuniao', true, 12);
        $p2Lounge = $this->criarSetor($piso2, 'P2-LOU', 'Lounge Privado', 'lounge', false, 20);
        $p2Exterior = $this->criarSetor($piso2, 'P2-EXT', 'Coworking Exterior', 'coworking', true, 20);

        $this->criarSecretarias($p0Coworking, 'A', 1, 16);
        $this->criarSecretarias($p0Reuniao, 'A', 17, 22);
        $this->criarSecretarias($p0Phone, 'A', 23, 26);

        $this->criarSecretarias($p1Coworking, 'B', 1, 18);
        $this->criarSecretarias($p1Reuniao, 'B', 19, 26);
        $this->criarSecretarias($p1Concentracao, 'B', 27, 34);
        $this->criarSecretarias($p1Phone, 'B', 35, 38);

        $this->criarSecretarias($p2Coworking, 'C', 1, 20);
        $this->criarSecretarias($p2Reuniao, 'C', 21, 26);
        $this->criarSecretarias($p2Exterior, 'C', 27, 36);
    }

    private function criarSetor(
        Piso $piso,
        string $codigo,
        string $nome,
        string $tipo,
        bool $reservavel,
        int $capacidade
    ): Setor {
        return Setor::updateOrCreate(
            [
                'piso_id' => $piso->id,
                'codigo' => $codigo,
            ],
            [
                'nome' => $nome,
                'tipo' => $tipo,
                'reservavel' => $reservavel,
                'capacidade' => $capacidade,
                'descricao' => $nome . ' do ' . $piso->nome,
                'ativo' => true,
            ]
        );
    }

    private function criarSecretarias(
        Setor $setor,
        string $prefixo,
        int $inicio,
        int $fim
    ): void {
        for ($i = $inicio; $i <= $fim; $i++) {
            Secretaria::updateOrCreate(
                [
                    'setor_id' => $setor->id,
                    'codigo' => $prefixo . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                ],
                [
                    'planta_x' => null,
                    'planta_y' => null,
                    'angulo' => 0,
                    'monitor' => $i % 2 === 0,
                    'dock_usb' => $i % 3 === 0,
                    'junto_janela' => $i % 4 === 0,
                    'ergonomica' => true,
                    'reservavel' => true,
                    'ativo' => true,
                    'descricao' => 'Secretária de trabalho SpaceHub.',
                ]
            );
        }
    }
}
