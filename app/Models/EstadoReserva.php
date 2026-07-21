<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoReserva extends Model
{
    protected $fillable = [
        'nome',
        'codigo',
        'descricao',
    ];

   
    public function reservas(): HasMany
{
    return $this->hasMany(Reserva::class);
}
}