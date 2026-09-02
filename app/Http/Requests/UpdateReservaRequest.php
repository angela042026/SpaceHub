<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => [
                'sometimes',
                'required',
                'date',
            ],

            'periodo_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:periodos,id',
            ],

            'secretaria_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:secretarias,id',
            ],

            'observacoes' => [
                'sometimes',
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }
}
