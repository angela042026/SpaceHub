<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Piso extends Model
{
    protected $fillable = [
        'edificio_id',
        'nome',
        'codigo',
        'numero',
        'planta',
        'descricao',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'edificio_id' => 'integer',
            'numero' => 'integer',
            'ativo' => 'boolean',
        ];
    }

    public function edificio(): BelongsTo
    {
        return $this->belongsTo(Edificio::class);
    }

    public function setores(): HasMany
    {
        return $this->hasMany(Setor::class);
    }
}