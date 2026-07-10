<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoReserva extends Model
{
    protected $fillable = [
        'nome',
        'codigo',
        'descricao',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}