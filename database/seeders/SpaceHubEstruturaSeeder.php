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

        // Coordenadas em grelha (% da imagem da planta) — aproximação para dar
        // vida ao mapa de ocupação; não são posições pixel-perfect das plantas reais.
        $this->criarSecretarias($p0Coworking, 'A', 1, 16, xInicio: 10, yInicio: 15, colunas: 8);
        $this->criarSecretarias($p0Reuniao, 'A', 17, 22, xInicio: 10, yInicio: 55, colunas: 6);
        $this->criarSecretarias($p0Phone, 'A', 23, 26, xInicio: 70, yInicio: 55, colunas: 4);

        $this->criarSecretarias($p1Coworking, 'B', 1, 18, xInicio: 10, yInicio: 15, colunas: 9);
        $this->criarSecretarias($p1Reuniao, 'B', 19, 26, xInicio: 10, yInicio: 55, colunas: 8);
        $this->criarSecretarias($p1Concentracao, 'B', 27, 34, xInicio: 10, yInicio: 75, colunas: 8);
        $this->criarSecretarias($p1Phone, 'B', 35, 38, xInicio: 75, yInicio: 75, colunas: 4);

        $this->criarSecretarias($p2Coworking, 'C', 1, 20, xInicio: 10, yInicio: 15, colunas: 10);
        $this->criarSecretarias($p2Reuniao, 'C', 21, 26, xInicio: 10, yInicio: 55, colunas: 6);
        $this->criarSecretarias($p2Exterior, 'C', 27, 36, xInicio: 10, yInicio: 75, colunas: 10);
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
        int $fim,
        float $xInicio = 15,
        float $yInicio = 20,
        int $colunas = 6,
        float $xPasso = 8,
        float $yPasso = 14
    ): void {
        for ($i = $inicio; $i <= $fim; $i++) {
            $indice = $i - $inicio;
            $coluna = $indice % $colunas;
            $linha = intdiv($indice, $colunas);

            Secretaria::updateOrCreate(
                [
                    'setor_id' => $setor->id,
                    'codigo' => $prefixo . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                ],
                [
                    'planta_x' => (int) min($xInicio + ($coluna * $xPasso), 95),
                    'planta_y' => (int) min($yInicio + ($linha * $yPasso), 95),
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
