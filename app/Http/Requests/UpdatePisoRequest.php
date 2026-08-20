<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $piso = $this->route('piso');

        return [
            'edificio_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:edificios,id',
            ],

            'nome' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'nome_en' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:10',
                Rule::unique('pisos')
                    ->where(
                        fn ($query) => $query->where(
                            'edificio_id',
                            $this->integer('edificio_id')
                                ?: $piso->edificio_id
                        )
                    )
                    ->ignore($piso),
            ],

            'numero' => [
                'sometimes',
                'required',
                'integer',
            ],

            'planta' => [
                'sometimes',
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