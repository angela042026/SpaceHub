<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoReserva extends Model
{
    /**
     * Campos que podem ser preenchidos em massa.
     */
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