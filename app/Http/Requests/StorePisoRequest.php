<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'edificio_id' => ['required', 'exists:edificios,id'],
            'nome' => ['required', 'string', 'max:100'],
            'codigo' => [
                'required',
                'string',
                'max:10',
                Rule::unique('pisos')->where(fn ($query) =>
                    $query->where('edificio_id', $this->edificio_id)
                ),
            ],
            'numero' => ['required', 'integer'],
            'planta' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string'],
            'ativo' => ['boolean'],
        ];
    }
}