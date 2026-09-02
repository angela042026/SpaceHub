<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Piso extends Model
{
    protected $fillable = [
        'edificio_id',
        'nome',
        'nome_en',
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

    /**
     * Nome a apresentar no idioma ativo — mesmo padrão de
     * Setor::nomeLocalizado(), ver a nota lá.
     */
    protected function nomeLocalizado(): Attribute
    {
        return Attribute::make(
            get: fn () => app()->getLocale() === 'en' && $this->nome_en
                ? $this->nome_en
                : $this->nome,
        );
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
