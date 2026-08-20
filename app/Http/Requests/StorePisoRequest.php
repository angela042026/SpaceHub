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
            'edificio_id' => [
                'required',
                'integer',
                'exists:edificios,id',
            ],

            'nome' => [
                'required',
                'string',
                'max:100',
            ],

            'nome_en' => [
                'nullable',
                'string',
                'max:100',
            ],

            'codigo' => [
                'required',
                'string',
                'max:10',
                Rule::unique('pisos')->where(
                    fn ($query) => $query->where(
                        'edificio_id',
                        $this->integer('edificio_id')
                    )
                ),
            ],

            'numero' => [
                'required',
                'integer',
            ],

            'planta' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'descricao' => [
                'nullable',
                'string',
            ],
        ];
    }
}