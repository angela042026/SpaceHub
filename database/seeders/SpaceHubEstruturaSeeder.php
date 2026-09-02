<?php

namespace Database\Seeders;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\Secretaria;
use App\Models\Setor;
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

        $this->criarSetor(
            piso: $garagem,
            codigo: 'EST',
            nome: 'Estacionamento',
            tipo: 'estacionamento',
            reservavel: false,
            capacidade: 20
        );

        $this->criarSetor(
            piso: $garagem,
            codigo: 'TEC',
            nome: 'Zona Técnica',
            tipo: 'tecnico',
            reservavel: false,
            capacidade: 5
        );

        // =====================================================
        // PISO 0
        // =====================================================

        $osc = $this->criarSetor(
            piso: $piso0,
            codigo: 'OSC',
            nome: 'Open Space Central',
            tipo: 'open_space',
            reservavel: true,
            capacidade: 34,
            precoMeioDia: 8.00,
            precoDiaInteiro: 14.00
        );

        $osn = $this->criarSetor(
            piso: $piso0,
            codigo: 'OSN',
            nome: 'Open Space Norte',
            tipo: 'open_space',
            reservavel: true,
            capacidade: 14,
            precoMeioDia: 7.00,
            precoDiaInteiro: 12.00
        );

        $pb0 = $this->criarSetor(
            piso: $piso0,
            codigo: 'PB',
            nome: 'Phone Booth',
            tipo: 'phone_booth',
            reservavel: true,
            capacidade: 10,
            precoMeioDia: 5.00,
            precoDiaInteiro: 9.00
        );

        $this->criarSetor(
            piso: $piso0,
            codigo: 'REC',
            nome: 'Receção',
            tipo: 'rececao',
            reservavel: false,
            capacidade: 1
        );

        $this->criarSetor(
            piso: $piso0,
            codigo: 'LOU',
            nome: 'Lounge',
            tipo: 'lounge',
            reservavel: false,
            capacidade: 1
        );

        $this->criarSetor(
            piso: $piso0,
            codigo: 'COP',
            nome: 'Copa',
            tipo: 'copa',
            reservavel: false,
            capacidade: 1
        );

        $this->criarSetor(
            piso: $piso0,
            codigo: 'WC',
            nome: 'Instalações Sanitárias',
            tipo: 'wc',
            reservavel: false,
            capacidade: 2
        );

        // =====================================================
        // PISO 1
        // =====================================================

        $e = $this->criarSetor(
            piso: $piso1,
            codigo: 'E',
            nome: 'Escritório',
            tipo: 'escritorio',
            reservavel: true,
            capacidade: 5,
            precoMeioDia: 25.00,
            precoDiaInteiro: 45.00
        );

        $srg = $this->criarSetor(
            piso: $piso1,
            codigo: 'SRG',
            nome: 'Sala de Reuniões Grande',
            tipo: 'sala_reunioes',
            reservavel: true,
            capacidade: 2,
            precoMeioDia: 45.00,
            precoDiaInteiro: 80.00
        );

        $srm = $this->criarSetor(
            piso: $piso1,
            codigo: 'SRM',
            nome: 'Sala de Reuniões Média',
            tipo: 'sala_reunioes',
            reservavel: true,
            capacidade: 1,
            precoMeioDia: 30.00,
            precoDiaInteiro: 55.00
        );

        $srr = $this->criarSetor(
            piso: $piso1,
            codigo: 'SRR',
            nome: 'Sala de Reuniões Redonda',
            tipo: 'sala_reunioes',
            reservavel: true,
            capacidade: 1,
            precoMeioDia: 25.00,
            precoDiaInteiro: 45.00
        );

        $pb1 = $this->criarSetor(
            piso: $piso1,
            codigo: 'PB',
            nome: 'Phone Booth',
            tipo: 'phone_booth',
            reservavel: true,
            capacidade: 5,
            precoMeioDia: 5.00,
            precoDiaInteiro: 9.00
        );

        $this->criarSetor(
            piso: $piso1,
            codigo: 'COP',
            nome: 'Copa',
            tipo: 'copa',
            reservavel: false,
            capacidade: 1
        );

        $this->criarSetor(
            piso: $piso1,
            codigo: 'SE',
            nome: 'Sala de Espera',
            tipo: 'sala_espera',
            reservavel: false,
            capacidade: 1
        );

        // =====================================================
        // PISO 2
        // =====================================================

        $ee = $this->criarSetor(
            piso: $piso2,
            codigo: 'EE',
            nome: 'Escritório Executivo',
            tipo: 'escritorio_executivo',
            reservavel: true,
            capacidade: 7,
            precoMeioDia: 35.00,
            precoDiaInteiro: 65.00
        );

        $sre = $this->criarSetor(
            piso: $piso2,
            codigo: 'SRE',
            nome: 'Sala de Reuniões Executiva',
            tipo: 'sala_reunioes',
            reservavel: true,
            capacidade: 1,
            precoMeioDia: 55.00,
            precoDiaInteiro: 100.00
        );

        $scr = $this->criarSetor(
            piso: $piso2,
            codigo: 'SCR',
            nome: 'Sala Criativa',
            tipo: 'sala_criativa',
            reservavel: true,
            capacidade: 1,
            precoMeioDia: 35.00,
            precoDiaInteiro: 65.00
        );

        $pb2 = $this->criarSetor(
            piso: $piso2,
            codigo: 'PB',
            nome: 'Phone Booth',
            tipo: 'phone_booth',
            reservavel: true,
            capacidade: 2,
            precoMeioDia: 5.00,
            precoDiaInteiro: 9.00
        );

        $this->criarSetor(
            piso: $piso2,
            codigo: 'SE',
            nome: 'Sala de Espera',
            tipo: 'sala_espera',
            reservavel: false,
            capacidade: 1
        );

        $this->criarSetor(
            piso: $piso2,
            codigo: 'COP',
            nome: 'Copa',
            tipo: 'copa',
            reservavel: false,
            capacidade: 2
        );

        $this->criarSetor(
            piso: $piso2,
            codigo: 'WC',
            nome: 'Instalações Sanitárias',
            tipo: 'wc',
            reservavel: false,
            capacidade: 4
        );

        // =====================================================
        // SECRETÁRIAS - PISO 0
        // =====================================================

        $this->criarSecretarias(
            $osc,
            'OSC',
            1,
            34,
            xInicio: 10,
            yInicio: 15,
            colunas: 8,
            monitor: true,
            dockUsb: true,
            luzNatural: true,
            proximoCopa: true,
            lugaresJuntoJanela: [1, 12, 18, 24, 25, 30, 31, 32, 33, 34]
        );

        $this->criarSecretarias(
            $osn,
            'OSN',
            1,
            14,
            xInicio: 10,
            yInicio: 55,
            colunas: 7,
            monitor: true,
            dockUsb: true,
            luzNatural: true,
            zonaSilenciosa: true,
            lugaresJuntoJanela: [1, 14]
        );

        $this->criarSecretarias(
            $pb0,
            'PB',
            1,
            10,
            xInicio: 75,
            yInicio: 15,
            colunas: 2,
            zonaSilenciosa: true
        );

        // =====================================================
        // SECRETÁRIAS - PISO 1
        // =====================================================

        $this->criarSecretarias(
            $e,
            'E',
            1,
            5,
            xInicio: 10,
            yInicio: 15,
            colunas: 5,
            monitor: true,
            dockUsb: true,
            hdmi: true,
            luzNatural: true,
            zonaSilenciosa: true,
            juntoJanelaTodos: true
        );

        $this->criarSecretarias(
            $srg,
            'SRG',
            1,
            2,
            xInicio: 10,
            yInicio: 50,
            colunas: 2,
            zonaSilenciosa: true
        );

        $this->criarSecretarias(
            $srm,
            'SRM',
            1,
            1,
            xInicio: 35,
            yInicio: 50,
            colunas: 1,
            zonaSilenciosa: true
        );

        $this->criarSecretarias(
            $srr,
            'SRR',
            1,
            1,
            xInicio: 55,
            yInicio: 50,
            colunas: 1,
            zonaSilenciosa: true
        );

        $this->criarSecretarias(
            $pb1,
            'PB',
            1,
            5,
            xInicio: 75,
            yInicio: 20,
            colunas: 1,
            zonaSilenciosa: true
        );

        // =====================================================
        // SECRETÁRIAS - PISO 2
        // =====================================================

        $this->criarSecretarias(
            $ee,
            'EE',
            1,
            7,
            xInicio: 10,
            yInicio: 15,
            colunas: 4,
            luzNatural: true,
            zonaSilenciosa: true,
            juntoJanelaTodos: true
        );

        $this->criarSecretarias(
            $sre,
            'SRE',
            1,
            1,
            xInicio: 20,
            yInicio: 55,
            colunas: 1,
            zonaSilenciosa: true
        );

        $this->criarSecretarias(
            $scr,
            'SCR',
            1,
            1,
            xInicio: 50,
            yInicio: 55,
            colunas: 1
        );

        $this->criarSecretarias(
            $pb2,
            'PB',
            1,
            2,
            xInicio: 80,
            yInicio: 20,
            colunas: 1,
            zonaSilenciosa: true
        );
    }

    private function criarSetor(
        Piso $piso,
        string $codigo,
        string $nome,
        string $tipo,
        bool $reservavel,
        int $capacidade,
        ?float $precoMeioDia = null,
        ?float $precoDiaInteiro = null
    ): Setor {
        $precoSemanal = null;
        $precoMensal = null;
        $precoAnual = null;

        if ($reservavel && $precoDiaInteiro !== null) {
            // Reserva semanal: 7 dias corridos, sem desconto.
            $precoSemanal = round($precoDiaInteiro * 7, 2);

            // Reserva mensal: 30 dias corridos, com 10% de desconto.
            $precoMensal = round(
                ($precoDiaInteiro * 30) * 0.90,
                2
            );

            // Reserva anual: 365 dias corridos, com 20% de desconto.
            $precoAnual = round(
                ($precoDiaInteiro * 365) * 0.80,
                2
            );
        }

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

                'preco_meio_dia' => $reservavel
                    ? $precoMeioDia
                    : null,

                'preco_dia_inteiro' => $reservavel
                    ? $precoDiaInteiro
                    : null,

                'preco_semanal' => $precoSemanal,
                'preco_mensal' => $precoMensal,
                'preco_anual' => $precoAnual,

                'descricao' => $nome.' - '.$piso->nome,
                'ativo' => true,
            ]
        );
    }

    /**
     * Cria as secretárias de um setor.
     *
     * As características (monitor, hdmi, luz natural, etc.) são passadas
     * explicitamente por cada chamada, em vez de inferidas de $setor->tipo,
     * para corresponderem exatamente à tabela de características por
     * piso/setor definida no documento do projeto — e para que um piso ou
     * setor que não devesse ter uma característica não a receba por engano
     * (ex.: Escritório Executivo não tem Monitor/Dock USB).
     */
    private function criarSecretarias(
        Setor $setor,
        string $prefixo,
        int $inicio,
        int $fim,
        float $xInicio = 15,
        float $yInicio = 20,
        int $colunas = 6,
        float $xPasso = 8,
        float $yPasso = 14,
        bool $monitor = false,
        bool $dockUsb = false,
        bool $hdmi = false,
        bool $luzNatural = false,
        bool $zonaSilenciosa = false,
        bool $proximoCopa = false,
        bool $juntoJanelaTodos = false,
        array $lugaresJuntoJanela = []
    ): void {
        for ($i = $inicio; $i <= $fim; $i++) {
            $indice = $i - $inicio;

            $coluna = $indice % $colunas;
            $linha = intdiv($indice, $colunas);

            Secretaria::updateOrCreate(
                [
                    'setor_id' => $setor->id,
                    'codigo' => $prefixo
                        .str_pad($i, 2, '0', STR_PAD_LEFT),
                ],
                [
                    'descricao' => $setor->nome
                        .' '
                        .str_pad($i, 2, '0', STR_PAD_LEFT),

                    'planta_x' => (int) min(
                        $xInicio + ($coluna * $xPasso),
                        95
                    ),

                    'planta_y' => (int) min(
                        $yInicio + ($linha * $yPasso),
                        95
                    ),

                    'angulo' => 0,

                    'monitor' => $monitor,
                    'dock_usb' => $dockUsb,
                    'hdmi' => $hdmi,

                    'junto_janela' => $juntoJanelaTodos
                        || in_array($i, $lugaresJuntoJanela, true),

                    'ergonomica' => $setor->tipo !== 'phone_booth',

                    'luz_natural' => $luzNatural,
                    'zona_silenciosa' => $zonaSilenciosa,
                    'proximo_copa' => $proximoCopa,

                    'reservavel' => true,

                    'ativo' => true,
                ]
            );
        }
    }
}
