<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EdificioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'codigo' => $this->codigo,
            'morada' => $this->morada,
            'codigo_postal' => $this->codigo_postal,
            'cidade' => $this->cidade,
            'pais' => $this->pais,
            'telefone' => $this->telefone,
            'email' => $this->email,
            'imagem' => $this->imagem,
            'imagem_url' => $this->imagem_url,
            'hora_abertura' => $this->hora_abertura,
            'hora_fecho' => $this->hora_fecho,
            'ativo' => (bool) $this->ativo,
            'descricao' => $this->descricao,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}