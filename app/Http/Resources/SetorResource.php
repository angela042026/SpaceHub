<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SetorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'piso_id' => $this->piso_id,
            'piso' => $this->whenLoaded('piso', fn () => $this->piso->nome),
            'nome' => $this->nome,
            'codigo' => $this->codigo,
            'tipo' => $this->tipo,
            'reservavel' => (bool) $this->reservavel,
            'capacidade' => $this->capacidade,
            'descricao' => $this->descricao,
            'ativo' => (bool) $this->ativo,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}