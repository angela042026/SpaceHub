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

            'piso' => $this->whenLoaded(
                'piso',
                fn () => $this->piso->nome_localizado
            ),

            'nome' => $this->nome,
            'nome_en' => $this->nome_en,
            'nome_localizado' => $this->nome_localizado,
            'codigo' => $this->codigo,
            'tipo' => $this->tipo,

            'reservavel' => (bool) $this->reservavel,
            'capacidade' => $this->capacidade,

            'descricao' => $this->descricao,
            'ativo' => (bool) $this->ativo,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
