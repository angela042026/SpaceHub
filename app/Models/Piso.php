<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Piso extends Model
{
    protected $fillable = [
        'localidade_id',
        'nome',
        'numero',
        'ativo',
    ];

    public function edificio()
{
    return $this->belongsTo(Edificio::class);
}
}