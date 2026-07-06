<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setor extends Model
{
    protected $fillable = [
        'piso_id',
        'nome',
        'codigo',
        'tipo',
        'reservavel',
        'capacidade',
        'descricao',
        'ativo',
    ];

    public function piso()
    {
        return $this->belongsTo(Piso::class);
    }
}