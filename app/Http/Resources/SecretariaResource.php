<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SecretariaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'setor_id' => $this->setor_id,

            'setor' => $this->whenLoaded(
                'setor',
                fn () => $this->setor->nome
            ),

            'codigo' => $this->codigo,
            'planta_x' => $this->planta_x,
            'planta_y' => $this->planta_y,
            'angulo' => $this->angulo,

            'monitor' => (bool) $this->monitor,
            'dock_usb' => (bool) $this->dock_usb,
            'junto_janela' => (bool) $this->junto_janela,
            'ergonomica' => (bool) $this->ergonomica,
            'reservavel' => (bool) $this->reservavel,
            'ativo' => (bool) $this->ativo,

            'descricao' => $this->descricao,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}