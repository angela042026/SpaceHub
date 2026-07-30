<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvaliacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nota' => $this->nota,
            'comentario' => $this->comentario,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),

            'reserva' => $this->whenLoaded('reserva', fn () => [
                'id' => $this->reserva->id,
                'data' => $this->reserva->data?->format('Y-m-d'),
                'utilizador' => $this->reserva->user?->name,
                'secretaria' => $this->reserva->secretaria?->codigo,
                'setor' => $this->reserva->secretaria?->setor?->nome,
                'periodo' => $this->reserva->periodo?->nome,
            ]),
        ];
    }
}
