<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagamentoResource extends JsonResource
{
    /**
     * Transformar o pagamento numa resposta JSON.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reserva_id' => $this->reserva_id,
            'valor' => $this->valor,
            'metodo_pagamento' => $this->metodo_pagamento,
            'estado' => $this->estado,
            'referencia' => $this->referencia,

            'data_pagamento' => $this->data_pagamento
                ?->toISOString(),

            'observacoes' => $this->observacoes,

            'reserva' => $this->whenLoaded(
                'reserva',
                function (): array {
                    return [
                        'id' => $this->reserva->id,
                        'data' => $this->reserva->data
                            ?->format('Y-m-d'),

                        'cancelada_at' =>
                            $this->reserva->cancelada_at
                                ?->toISOString(),

                        'periodo' => $this->reserva->periodo
                            ? [
                                'id' =>
                                    $this->reserva->periodo->id,

                                'nome' =>
                                    $this->reserva->periodo->nome,

                                'hora_inicio' =>
                                    $this->reserva
                                        ->periodo
                                        ->hora_inicio,

                                'hora_fim' =>
                                    $this->reserva
                                        ->periodo
                                        ->hora_fim,
                            ]
                            : null,

                        'secretaria' => $this->reserva->secretaria
                            ? [
                                'id' =>
                                    $this->reserva->secretaria->id,

                                'codigo' =>
                                    $this->reserva
                                        ->secretaria
                                        ->codigo,

                                'setor' =>
                                    $this->reserva
                                        ->secretaria
                                        ->setor
                                        ? [
                                            'id' =>
                                                $this->reserva
                                                    ->secretaria
                                                    ->setor
                                                    ->id,

                                            'nome' =>
                                                $this->reserva
                                                    ->secretaria
                                                    ->setor
                                                    ->nome,
                                        ]
                                        : null,
                            ]
                            : null,
                    ];
                }
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}