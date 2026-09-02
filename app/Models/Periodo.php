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

    protected $casts = [
        'hora_inicio' => 'datetime:H:i',
        'hora_fim' => 'datetime:H:i',
        'ativo' => 'boolean',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
