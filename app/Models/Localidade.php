<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Localidade extends Model
{
    protected $fillable = [
        'nome',
        'codigo',
        'morada',
        'codigo_postal',
        'cidade',
        'pais',
        'telefone',
        'email',
        'imagem',
        'hora_abertura',
        'hora_fecho',
        'ativo',
        'descricao',
    ];

    public function pisos()
    {
        return $this->hasMany(Piso::class);
    }
}