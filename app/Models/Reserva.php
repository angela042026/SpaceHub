<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $fillable = [
        'user_id',
        'secretaria_id',
        'periodo_id',
        'estado_reserva_id',
        'data',
        'check_in_at',
        'cancelada_at',
        'observacoes',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'secretaria_id' => 'integer',
        'periodo_id' => 'integer',
        'estado_reserva_id' => 'integer',
        'data' => 'date',
        'check_in_at' => 'datetime',
        'cancelada_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function secretaria()
    {
        return $this->belongsTo(Secretaria::class);
    }

    public function periodo()
    {
        return $this->belongsTo(Periodo::class);
    }

    public function estadoReserva()
    {
        return $this->belongsTo(EstadoReserva::class);
    }
}