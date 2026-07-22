<?php

namespace App\Services;

use App\Models\Pagamento;
use App\Models\Reserva;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PagamentoService
{
    /**
     * Cria um pagamento pendente para uma reserva.
     */
    public function criarParaReserva(Reserva $reserva): Pagamento
    {
        $reserva->loadMissing([
            'secretaria.setor',
            'periodo',
        ]);

        $setor = $reserva->secretaria?->setor;
        $periodo = $reserva->periodo;

        if ($setor === null) {
            throw ValidationException::withMessages([
                'secretaria_id' =>
                    'Não foi possível determinar o setor da reserva.',
            ]);
        }

        if ($periodo === null) {
            throw ValidationException::withMessages([
                'periodo_id' =>
                    'Não foi possível determinar o período da reserva.',
            ]);
        }

        $valor = $this->calcularValor(
            $periodo->nome,
            $setor->preco_meio_dia,
            $setor->preco_dia_inteiro
        );

        return Pagamento::create([
            'reserva_id' => $reserva->id,
            'valor' => $valor,
            'estado' => 'pendente',
            'referencia' => $this->gerarReferencia(),
            'data_pagamento' => null,
            'observacoes' => null,
        ]);
    }

    /**
     * Calcula o preço com base no período selecionado.
     */
    private function calcularValor(
        string $nomePeriodo,
        float|string|null $precoMeioDia,
        float|string|null $precoDiaInteiro
    ): float {
        $diaInteiro = mb_strtolower(trim($nomePeriodo))
            === 'dia inteiro';

        $valor = $diaInteiro
            ? $precoDiaInteiro
            : $precoMeioDia;

        if ($valor === null) {
            throw ValidationException::withMessages([
                'secretaria_id' =>
                    'O espaço selecionado ainda não possui um preço definido.',
            ]);
        }

        return round((float) $valor, 2);
    }

    /**
     * Gera uma referência interna única para o pagamento.
     */
    private function gerarReferencia(): string
    {
        do {
            $referencia = 'SPH-' . strtoupper(Str::random(12));
        } while (
            Pagamento::where('referencia', $referencia)->exists()
        );

        return $referencia;
    }
}