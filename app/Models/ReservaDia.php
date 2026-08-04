<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Uma linha por dia+slot ocupado por uma reserva — existe só para dar
 * à base de dados uma trava de escrita real contra reservas
 * sobrepostas com datas de início diferentes (ver
 * 2026_08_04_010000_create_reserva_dias_table). Não é consultada pela
 * disponibilidade mostrada ao utilizador; isso continua a cargo de
 * ReservaDisponibilidadeService.
 */
class ReservaDia extends Model
{
    protected $fillable = [
        'reserva_id',
        'secretaria_id',
        'user_id',
        'dia',
        'slot',
    ];

    protected function casts(): array
    {
        return [
            'dia' => 'date',
        ];
    }

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class);
    }
}
