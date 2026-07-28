<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvaliacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nota' => [
                'required',
                'integer',
                'between:1,5',
            ],

            'comentario' => [
                'required',
                'string',
                'max:1000',
            ],
        ];
    }
}
