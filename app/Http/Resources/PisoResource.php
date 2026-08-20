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
            'nome_en' => $this->nome_en,
            'nome_localizado' => $this->nome_localizado,
            'codigo' => $this->codigo,
            'numero' => $this->numero,

            'planta' => $this->planta,

            // Os pisos semeados (SpaceHubEstruturaSeeder) guardam a planta
            // como caminho público absoluto (ex: "/images/maps/Piso0.png"),
            // enquanto uploads feitos pelo formulário guardam um caminho
            // relativo ao disco "public" (via Storage::disk('public')->store()).
            // É preciso distinguir os dois para gerar sempre a URL correta.
            'planta_url' => $this->planta
                ? (str_starts_with($this->planta, '/')
                    ? asset($this->planta)
                    : asset('storage/' . $this->planta))
                : null,

            'descricao' => $this->descricao,
            'ativo' => (bool) $this->ativo,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}