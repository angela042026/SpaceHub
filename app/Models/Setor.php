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
        'descricao',
        'ativo',
        'planta_x',
        'planta_y',
    ];

    protected function casts(): array
    {
        return [
            'piso_id' => 'integer',
            'reservavel' => 'boolean',
            'ativo' => 'boolean',
            'capacidade' => 'integer',
            'planta_x' => 'integer',
            'planta_y' => 'integer',
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