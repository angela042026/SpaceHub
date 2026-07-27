<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Setor extends Model
{
    protected $table = 'setores';

    protected $fillable = [
        'piso_id',
        'nome',
        'codigo',
        'tipo',
        'reservavel',
        'capacidade',
        'preco_meio_dia',
        'preco_dia_inteiro',
        'preco_semanal',
        'preco_mensal',
        'preco_anual',
        'descricao',
        'ativo',
        'planta_x',
        'planta_y',
        'planta_largura',
        'planta_altura',
    ];

    protected function casts(): array
    {
        return [
            'piso_id' => 'integer',
            'capacidade' => 'integer',

            'preco_meio_dia' => 'decimal:2',
            'preco_dia_inteiro' => 'decimal:2',
            'preco_semanal' => 'decimal:2',
            'preco_mensal' => 'decimal:2',
            'preco_anual' => 'decimal:2',

            'reservavel' => 'boolean',
            'ativo' => 'boolean',

            'planta_x' => 'integer',
            'planta_y' => 'integer',
            'planta_largura' => 'integer',
            'planta_altura' => 'integer',
        ];
    }

    public function piso(): BelongsTo
    {
        return $this->belongsTo(Piso::class);
    }

    public function secretarias(): HasMany
    {
        return $this->hasMany(Secretaria::class);
    }
}