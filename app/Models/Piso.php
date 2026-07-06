<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    /**
     * Um piso pertence a um edifício.
     */
    public function edificio()
    {
        return $this->belongsTo(Edificio::class);
    }

    /**
     * Um piso possui vários setores.
     */
  
    public function setores()
{
    return $this->hasMany(Setor::class);
}
}