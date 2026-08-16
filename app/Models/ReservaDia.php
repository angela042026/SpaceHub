<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Uma linha por dia+slot ocupado por uma reserva — existe sobretudo
 * para dar à base de dados uma trava de escrita real contra reservas
 * sobrepostas com datas de início diferentes (ver
 * 2026_08_04_010000_create_reserva_dias_table). A disponibilidade
 * mostrada ao utilizador continua a decidir-se pela própria Reserva
 * (ReservaDisponibilidadeService/MapaOcupacaoService) — mas ambos
 * passaram também a exigir que exista aqui uma linha para o dia
 * pedido: quando um dia específico de uma reserva confirmada é
 * libertado por falta de check-in (ver LiberarReservasSemCheckIn), a
 * sua linha é apagada, o que liberta ao mesmo tempo o índice único
 * (para outra reserva poder ocupar esse dia) e a disponibilidade
 * mostrada, sem afetar os restantes dias da mesma reserva.
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
