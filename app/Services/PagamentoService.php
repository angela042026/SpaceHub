<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Pagamento;
use App\Models\Reserva;
use Illuminate\Support\Facades\DB;
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
                'secretaria_id' => 'Não foi possível determinar o setor da reserva.',
            ]);
        }

        if ($periodo === null) {
            throw ValidationException::withMessages([
                'periodo_id' => 'Não foi possível determinar o período da reserva.',
            ]);
        }

        $valor = $this->calcularValor(
            $reserva->tipo_duracao ?? 'diaria',
            $periodo->nome,
            $setor->preco_meio_dia,
            $setor->preco_dia_inteiro,
            $setor->preco_semanal,
            $setor->preco_mensal,
            $setor->preco_anual
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
     * Cancela o pagamento associado a uma reserva.
     *
     * Um pagamento pendente passa para cancelado.
     * Um pagamento pago impede o cancelamento da reserva,
     * enquanto o fluxo de reembolso não estiver implementado.
     */
    public function cancelarParaReserva(Reserva $reserva): void
    {
        $pagamento = Pagamento::where(
            'reserva_id',
            $reserva->id
        )
            ->lockForUpdate()
            ->first();

        /*
         * Uma reserva antiga pode não possuir pagamento.
         * Nesse caso, o cancelamento da reserva pode continuar.
         */
        if ($pagamento === null) {
            return;
        }

        if ($pagamento->estado === 'pendente') {
            $pagamento->update([
                'estado' => 'cancelado',
                'data_pagamento' => null,
            ]);

            return;
        }

        /*
         * O pagamento já está cancelado.
         * Não é necessário alterar novamente.
         */
        if ($pagamento->estado === 'cancelado') {
            return;
        }

        /*
         * Um pagamento reembolsado já não representa
         * um valor recebido pela reserva.
         */
        if ($pagamento->estado === 'reembolsado') {
            return;
        }

        /*
         * Enquanto o reembolso não estiver implementado,
         * não permitimos cancelar uma reserva paga.
         */
        if ($pagamento->estado === 'pago') {
            throw ValidationException::withMessages([
                'pagamento' => 'Não é possível cancelar esta reserva porque o pagamento já foi confirmado. O reembolso ainda não se encontra disponível.',
            ]);
        }

        /*
         * Proteção contra estados inesperados.
         */
        throw ValidationException::withMessages([
            'pagamento' => 'Não foi possível cancelar a reserva devido ao estado atual do pagamento.',
        ]);
    }

    /**
     * Calcula o preço da reserva com base na duração
     * e no período selecionado.
     */
    private function calcularValor(
        string $tipoDuracao,
        string $nomePeriodo,
        float|string|null $precoMeioDia,
        float|string|null $precoDiaInteiro,
        float|string|null $precoSemanal,
        float|string|null $precoMensal,
        float|string|null $precoAnual
    ): float {
        $tipoDuracaoNormalizado = mb_strtolower(
            trim($tipoDuracao)
        );

        $nomePeriodoNormalizado = mb_strtolower(
            trim($nomePeriodo)
        );

        $duracoesLongas = [
            'semanal',
            'mensal',
            'anual',
        ];

        /*
         * As reservas semanais, mensais e anuais
         * apenas podem ser efetuadas em regime de dia inteiro.
         */
        if (
            in_array(
                $tipoDuracaoNormalizado,
                $duracoesLongas,
                true
            )
            &&
            $nomePeriodoNormalizado !== 'dia inteiro'
        ) {
            throw ValidationException::withMessages([
                'periodo_id' => 'As reservas semanais, mensais e anuais apenas podem ser efetuadas para o dia inteiro.',
            ]);
        }

        $valor = match ($tipoDuracaoNormalizado) {
            'diaria' => $nomePeriodoNormalizado === 'dia inteiro'
                ? $precoDiaInteiro
                : $precoMeioDia,

            'semanal' => $precoSemanal,

            'mensal' => $precoMensal,

            'anual' => $precoAnual,

            default => throw ValidationException::withMessages([
                'tipo_duracao' => 'O tipo de duração selecionado não é válido.',
            ]),
        };

        if ($valor === null) {
            throw ValidationException::withMessages([
                'secretaria_id' => 'O espaço selecionado ainda não possui um preço definido para esta duração.',
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
            $referencia = 'SPH-'.strtoupper(
                Str::random(12)
            );
        } while (
            Pagamento::where(
                'referencia',
                $referencia
            )->exists()
        );

        return $referencia;
    }

    /**
     * Atualiza o valor do pagamento associado a uma reserva.
     *
     * Apenas pagamentos pendentes podem ter o valor recalculado.
     */
    public function atualizarValorParaReserva(
        Reserva $reserva
    ): void {
        $pagamento = Pagamento::where(
            'reserva_id',
            $reserva->id
        )
            ->lockForUpdate()
            ->first();

        /*
         * Reservas antigas podem não ter pagamento associado.
         */
        if ($pagamento === null) {
            return;
        }

        /*
         * Um pagamento já concluído, cancelado ou reembolsado
         * não deve ter o valor alterado.
         */
        if ($pagamento->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'pagamento' => 'Não é possível alterar o espaço, o período ou a duração porque o pagamento já não se encontra pendente.',
            ]);
        }

        $reserva->load([
            'secretaria.setor',
            'periodo',
        ]);

        $setor = $reserva->secretaria?->setor;
        $periodo = $reserva->periodo;

        if ($setor === null) {
            throw ValidationException::withMessages([
                'secretaria_id' => 'Não foi possível determinar o setor da reserva.',
            ]);
        }

        if ($periodo === null) {
            throw ValidationException::withMessages([
                'periodo_id' => 'Não foi possível determinar o período da reserva.',
            ]);
        }

        $novoValor = $this->calcularValor(
            $reserva->tipo_duracao ?? 'diaria',
            $periodo->nome,
            $setor->preco_meio_dia,
            $setor->preco_dia_inteiro,
            $setor->preco_semanal,
            $setor->preco_mensal,
            $setor->preco_anual
        );

        $pagamento->update([
            'valor' => $novoValor,
        ]);
    }

    /**
     * Confirma um pagamento simulado.
     */
    public function confirmarPagamento(
        Pagamento $pagamento,
        string $metodoPagamento
    ): Pagamento {
        $metodosPermitidos = [
            'cartao',
            'mbway',
            'transferencia',
            'paypal',
        ];

        if (
            ! in_array(
                $metodoPagamento,
                $metodosPermitidos,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'metodo_pagamento' => 'O método de pagamento selecionado não é válido.',
            ]);
        }

        return DB::transaction(function () use (
            $pagamento,
            $metodoPagamento
        ): Pagamento {
            $pagamentoBloqueado = Pagamento::whereKey(
                $pagamento->id
            )
                ->lockForUpdate()
                ->firstOrFail();

            if ($pagamentoBloqueado->estado !== 'pendente') {
                throw ValidationException::withMessages([
                    'pagamento' => 'Este pagamento já não se encontra pendente.',
                ]);
            }

            $reserva = Reserva::whereKey(
                $pagamentoBloqueado->reserva_id
            )
                ->lockForUpdate()
                ->firstOrFail();

            if ($reserva->cancelada_at !== null) {
                throw ValidationException::withMessages([
                    'pagamento' => 'Não é possível pagar uma reserva cancelada.',
                ]);
            }

            $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');

            abort_if($estadoConfirmadaId === null, 404);

            $pagamentoBloqueado->update([
                'metodo_pagamento' => $metodoPagamento,
                'estado' => 'pago',
                'data_pagamento' => now(),
            ]);

            $reserva->update([
                'estado_reserva_id' => $estadoConfirmadaId,
            ]);

            return $pagamentoBloqueado->fresh([
                'reserva.estadoReserva',
            ]);
        });
    }
}
