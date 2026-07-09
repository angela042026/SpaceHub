<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user?->name,
            'secretaria' => $this->secretaria?->codigo,
            'periodo' => $this->periodo?->nome,
            'estado' => $this->estadoReserva?->nome,
            'data' => $this->data?->format('Y-m-d'),
            'check_in_at' => $this->check_in_at?->format('Y-m-d H:i:s'),
            'cancelada_at' => $this->cancelada_at?->format('Y-m-d H:i:s'),
            'observacoes' => $this->observacoes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}