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
                'descricao' => 'Piso -1 - Garagem e zonas técnicas.',
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
                'descricao' => 'Piso 0',
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
                'descricao' => 'Piso 1',
                'ativo' => true,
            ]
        );

        $piso2 = Piso::updateOrCreate(
            [
                'edificio_id' => $edificio->id,
                'codigo' => 'P2',
            ],
            [
                'nome' => 'Piso 2',
                'numero' => 2,
                'planta' => '/images/maps/Piso2Terraco.png',
                'descricao' => 'Piso 2',
                'ativo' => true,
            ]
        );

                // =====================================================
        // GARAGEM (não reservável)
        // =====================================================

        $this->criarSetor($garagem, 'EST', 'Estacionamento', 'estacionamento', false, 20);
        $this->criarSetor($garagem, 'TEC', 'Zona Técnica', 'tecnico', false, 5);

        // =====================================================
        // PISO 0
        // =====================================================

        $osc = $this->criarSetor($piso0, 'OSC', 'Open Space Central', 'open_space', true, 34);

        $osn = $this->criarSetor($piso0, 'OSN', 'Open Space Norte', 'open_space', true, 14);

        $pb0 = $this->criarSetor($piso0, 'PB', 'Phone Booth', 'phone_booth', true, 10);

        $this->criarSetor($piso0, 'REC', 'Receção', 'rececao', false, 1);

        $this->criarSetor($piso0, 'LOU', 'Lounge', 'lounge', false, 1);

        $this->criarSetor($piso0, 'COP', 'Copa', 'copa', false, 1);

        $this->criarSetor($piso0, 'WC', 'Instalações Sanitárias', 'wc', false, 2);

        // =====================================================
        // PISO 1
        // =====================================================

        $e = $this->criarSetor($piso1, 'E', 'Escritório', 'escritorio', true, 5);

        $srg = $this->criarSetor($piso1, 'SRG', 'Sala de Reuniões Grande', 'sala_reunioes', true, 2);

        $srm = $this->criarSetor($piso1, 'SRM', 'Sala de Reuniões Média', 'sala_reunioes', true, 1);

        $srr = $this->criarSetor($piso1, 'SRR', 'Sala de Reuniões Redonda', 'sala_reunioes', true, 1);

        $pb1 = $this->criarSetor($piso1, 'PB', 'Phone Booth', 'phone_booth', true, 5);

        $this->criarSetor($piso1, 'COP', 'Copa', 'copa', false, 1);

        $this->criarSetor($piso1, 'SE', 'Sala de Espera', 'sala_espera', false, 1);

        // =====================================================
        // PISO 2
        // =====================================================

        $ee = $this->criarSetor($piso2, 'EE', 'Escritório Executivo', 'escritorio_executivo', true, 7);

        $sre = $this->criarSetor($piso2, 'SRE', 'Sala de Reuniões Executiva', 'sala_reunioes', true, 1);

        $scr = $this->criarSetor($piso2, 'SCR', 'Sala Criativa', 'sala_criativa', true, 1);

        $pb2 = $this->criarSetor($piso2, 'PB', 'Phone Booth', 'phone_booth', true, 2);

        $this->criarSetor($piso2, 'SE', 'Sala de Espera', 'sala_espera', false, 1);

        $this->criarSetor($piso2, 'COP', 'Copa', 'copa', false, 2);

        $this->criarSetor($piso2, 'WC', 'Instalações Sanitárias', 'wc', false, 4);

                // =====================================================
        // SECRETÁRIAS - PISO 0
        // =====================================================

        $this->criarSecretarias($osc, 'OSC', 1, 34, xInicio: 10, yInicio: 15, colunas: 8);

        $this->criarSecretarias($osn, 'OSN', 1, 14, xInicio: 10, yInicio: 55, colunas: 7);

        $this->criarSecretarias($pb0, 'PB', 1, 10, xInicio: 75, yInicio: 15, colunas: 2);

        // =====================================================
        // SECRETÁRIAS - PISO 1
        // =====================================================

        $this->criarSecretarias($e, 'E', 1, 5, xInicio: 10, yInicio: 15, colunas: 5);

        $this->criarSecretarias($srg, 'SRG', 1, 2, xInicio: 10, yInicio: 50, colunas: 2);

        $this->criarSecretarias($srm, 'SRM', 1, 1, xInicio: 35, yInicio: 50, colunas: 1);

        $this->criarSecretarias($srr, 'SRR', 1, 1, xInicio: 55, yInicio: 50, colunas: 1);

        $this->criarSecretarias($pb1, 'PB', 1, 5, xInicio: 75, yInicio: 20, colunas: 1);

        // =====================================================
        // SECRETÁRIAS - PISO 2
        // =====================================================

        $this->criarSecretarias($ee, 'EE', 1, 7, xInicio: 10, yInicio: 15, colunas: 4);

        $this->criarSecretarias($sre, 'SRE', 1, 1, xInicio: 20, yInicio: 55, colunas: 1);

        $this->criarSecretarias($scr, 'SCR', 1, 1, xInicio: 50, yInicio: 55, colunas: 1);

        $this->criarSecretarias($pb2, 'PB', 1, 2, xInicio: 80, yInicio: 20, colunas: 1);
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
                'descricao' => $nome . ' - ' . $piso->nome,
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
                    'codigo' => $prefixo . str_pad($i, 2, '0', STR_PAD_LEFT),
                ],

                [

                    'descricao' => $setor->nome . ' ' . str_pad($i, 2, '0', STR_PAD_LEFT),

                    'planta_x' => (int) min($xInicio + ($coluna * $xPasso), 95),

                    'planta_y' => (int) min($yInicio + ($linha * $yPasso), 95),

                    'angulo' => 0,

                    'monitor' => in_array(
                        $setor->tipo,
                        [
                            'open_space',
                            'escritorio',
                            'escritorio_executivo'
                        ]
                    ),

                    'dock_usb' => in_array(
                        $setor->tipo,
                        [
                            'open_space',
                            'escritorio',
                            'escritorio_executivo'
                        ]
                    ),

                    'junto_janela' => false,

                    'ergonomica' => $setor->tipo !== 'phone_booth',

                    'reservavel' => true,

                    'ativo' => true,

                ]

            );
        }
    }

}


