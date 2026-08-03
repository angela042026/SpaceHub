<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSecretariaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'setor_id' => [
                'required',
                'exists:setores,id',
            ],

            'codigo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('secretarias')->where(
                    fn ($query) => $query->where(
                        'setor_id',
                        $this->integer('setor_id')
                    )
                ),
            ],

            'planta_x' => [
                'nullable',
                'integer',
            ],

            'planta_y' => [
                'nullable',
                'integer',
            ],

            'angulo' => [
                'nullable',
                'numeric',
                'min:0',
                'max:360',
            ],

            /*
            |--------------------------------------------------------------------------
            | Características da Secretária
            |--------------------------------------------------------------------------
            */

            'monitor' => [
                'sometimes',
                'boolean',
            ],


            'dock_usb' => [
                'sometimes',
                'boolean',
            ],

            'hdmi' => [
                'sometimes',
                'boolean',
            ],

            'ergonomica' => [
                'sometimes',
                'boolean',
            ],

            'junto_janela' => [
                'sometimes',
                'boolean',
            ],

            'luz_natural' => [
                'sometimes',
                'boolean',
            ],

            'zona_silenciosa' => [
                'sometimes',
                'boolean',
            ],

            'proximo_copa' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Estado
            |--------------------------------------------------------------------------
            */

            'reservavel' => [
                'sometimes',
                'boolean',
            ],

            'descricao' => [
                'nullable',
                'string',
            ],

            'imagem' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'ativo' => [
                'prohibited',
            ],

            'qr_token' => [
                'prohibited',
            ],
        ];
    }
}