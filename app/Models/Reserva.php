<?php

namespace App\Models;

use Database\Factories\ReservaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reserva extends Model
{
    /** @use HasFactory<ReservaFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'secretaria_id',
        'periodo_id',
        'estado_reserva_id',
        'data',
        'tipo_duracao',
        'data_fim',
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
            'data_fim' => 'date',
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

    /**
     * Avaliação deixada pelo utilizador, depois do check-in.
     */
    public function avaliacao(): HasOne
    {
        return $this->hasOne(Avaliacao::class);
    }

    /**
     * Reservas cujo intervalo [data, data_fim] cobre $dia — inclui
     * reservas de vários dias já em curso, não só as que começam em
     * $dia.
     *
     * Não filtra por cancelada_at nem por estado: é só o teste de
     * intervalo, para poder ser combinado com filtros diferentes
     * consoante quem chama (disponibilidade, métricas do dashboard,
     * mapa de ocupação).
     *
     * As reservas antigas sem data_fim preenchido só contam para o
     * próprio dia da reserva.
     */
    public function scopeNoIntervalo(Builder $query, $dia): Builder
    {
        return $query
            ->whereDate('data', '<=', $dia)
            ->where(function (Builder $query) use ($dia) {
                $query
                    ->whereDate('data_fim', '>=', $dia)
                    ->orWhere(function (Builder $query) use ($dia) {
                        $query
                            ->whereNull('data_fim')
                            ->whereDate('data', $dia);
                    });
            });
    }
}