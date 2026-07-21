<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Edificio extends Model
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

    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
        ];
    }

    public function pisos(): HasMany
    {
        return $this->hasMany(Piso::class);
    }
}