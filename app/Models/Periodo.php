<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Periodo extends Model
{
    protected $fillable = [
        'nome',
        'hora_inicio',
        'hora_fim',
        'ativo',
    ];
    public function reservas()
{
    return $this->hasMany(Reserva::class);
}
}
