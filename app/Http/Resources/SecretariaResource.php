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

            'piso' => $this->whenLoaded(
                'setor',
                fn () => $this->setor->piso?->nome
            ),

            'codigo' => $this->codigo,
            'planta_x' => $this->planta_x,
            'planta_y' => $this->planta_y,
            'angulo' => $this->angulo,

            /*
            |--------------------------------------------------------------------------
            | Características da Secretária
            |--------------------------------------------------------------------------
            */

            'monitor' => (bool) $this->monitor,
            'dois_monitores' => (bool) $this->dois_monitores,
            'dock_usb' => (bool) $this->dock_usb,
            'hdmi' => (bool) $this->hdmi,
            'ergonomica' => (bool) $this->ergonomica,
            'junto_janela' => (bool) $this->junto_janela,
            'luz_natural' => (bool) $this->luz_natural,
            'zona_silenciosa' => (bool) $this->zona_silenciosa,
            'proximo_copa' => (bool) $this->proximo_copa,

            /*
            |--------------------------------------------------------------------------
            | Estado
            |--------------------------------------------------------------------------
            */

            'reservavel' => (bool) $this->reservavel,
            'ativo' => (bool) $this->ativo,

            /*
            |--------------------------------------------------------------------------
            | Outros
            |--------------------------------------------------------------------------
            */

            'descricao' => $this->descricao,
            'imagem' => $this->imagem,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}