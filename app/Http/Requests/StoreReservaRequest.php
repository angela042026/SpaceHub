<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => [
                'required',
                'date',
            ],

            'periodo_id' => [
                'required',
                'integer',
                'exists:periodos,id',
            ],

            'secretaria_id' => [
                'required',
                'integer',
                'exists:secretarias,id',
            ],

            'observacoes' => [
                'nullable',
                'string',
                'max:500',
            ],

        ];
    }
}