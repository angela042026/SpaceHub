<?php

namespace Database\Seeders;

use App\Models\Pagamento;
use App\Models\Reserva;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PagamentoSeeder extends Seeder
{
    public function run(): void
    {
        $reservas = Reserva::query()
            ->with([
                'periodo',
                'secretaria.setor',
            ])
            ->whereDoesntHave('pagamento')
            ->get();

        foreach ($reservas as $index => $reserva) {
            $setor = $reserva->secretaria?->setor;
            $periodo = $reserva->periodo;

            if (
                $setor === null
                || $periodo === null
                || ! $setor->reservavel
            ) {
                continue;
            }

            $valor = $periodo->nome === 'Dia inteiro'
                ? $setor->preco_dia_inteiro
                : $setor->preco_meio_dia;

            if ($valor === null) {
                continue;
            }

            $estado = match ($index % 3) {
                0 => 'pago',
                1 => 'pendente',
                default => 'recusado',
            };

            Pagamento::create([
                'reserva_id' => $reserva->id,
                'valor' => $valor,

                'metodo_pagamento' => match ($index % 3) {
                    0 => 'cartao',
                    1 => 'mbway',
                    default => 'transferencia',
                },

                'estado' => $estado,

                'referencia' => sprintf(
                    'PAG-%s-%s',
                    now()->format('Ymd'),
                    Str::upper(Str::random(8))
                ),

                'data_pagamento' => $estado === 'pago'
                    ? now()
                    : null,

                'observacoes' => 'Pagamento simulado criado pelo seeder.',
            ]);
        }
    }
}
