<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEdificioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $edificio = $this->route('edificio');

        return [
            'nome' => 'sometimes|string|max:100',
            'codigo' => 'sometimes|string|max:20|unique:edificios,codigo,' . $edificio->id,

            'morada' => 'sometimes|string|max:255',
            'codigo_postal' => 'nullable|string|max:20',
            'cidade' => 'sometimes|string|max:100',
            'pais' => 'nullable|string|max:100',

            'telefone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'imagem' => 'nullable|string|max:255',

            'hora_abertura' => 'nullable|date_format:H:i',
            'hora_fecho' => 'nullable|date_format:H:i',

            'ativo' => 'boolean',
            'descricao' => 'nullable|string',
        ];
    }
}