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

    /**
     * Um estado pode estar associado a várias reservas.
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}