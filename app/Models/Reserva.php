<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'secretaria_id' => 'integer',
            'periodo_id' => 'integer',
            'estado_reserva_id' => 'integer',
            'data' => 'date',
            'check_in_at' => 'datetime',
            'cancelada_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function secretaria(): BelongsTo
    {
        return $this->belongsTo(Secretaria::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function estadoReserva(): BelongsTo
    {
        return $this->belongsTo(EstadoReserva::class);
    }

    /**
     * Pagamento associado à reserva.
     */
    public function pagamento(): HasOne
    {
        return $this->hasOne(Pagamento::class);
    }
}