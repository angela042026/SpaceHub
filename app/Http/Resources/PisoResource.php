<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PisoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'edificio_id' => $this->edificio_id,
            'edificio' => $this->edificio?->nome,
            'nome' => $this->nome,
            'codigo' => $this->codigo,
            'numero' => $this->numero,
            'planta' => $this->planta,
            'descricao' => $this->descricao,
            'ativo' => (bool) $this->ativo,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}