<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class EstadoReserva extends Model
{
    protected $fillable = [
        'nome',
        'codigo',
        'descricao',
    ];

    private const CODIGOS_ATIVOS = [
        'pendente',
        'confirmada',
    ];

    private const CODIGOS_VALIDOS = [
        'pendente',
        'confirmada',
        'concluida',
        'nao_compareceu',
    ];

    /**
     * Códigos dos estados considerados "ativos" (reserva em vigor, ainda não
     * cancelada/expirada/concluída). Fonte única partilhada entre controllers
     * e services que precisam desta lista, para evitar divergência entre eles.
     */
    public static function codigosAtivos(): array
    {
        return self::CODIGOS_ATIVOS;
    }

    /**
     * IDs dos estados considerados "ativos".
     */
    public static function idsAtivos(): array
    {
        return static::query()
            ->whereIn('codigo', self::CODIGOS_ATIVOS)
            ->pluck('id')
            ->all();
    }

    /**
     * Códigos dos estados considerados "válidos" para efeitos estatísticos
     * (inclui reservas já concluídas, ao contrário dos estados "ativos").
     */
    public static function codigosValidos(): array
    {
        return self::CODIGOS_VALIDOS;
    }

    /**
     * IDs dos estados considerados "válidos".
     */
    public static function idsValidos(): array
    {
        return static::query()
            ->whereIn('codigo', self::CODIGOS_VALIDOS)
            ->pluck('id')
            ->all();
    }

    /**
     * ID de um estado a partir do seu código, em cache — esta tabela é
     * dados de referência praticamente estáticos (sem CRUD na app), por
     * isso não há invalidação: só muda se alguém correr os seeders de novo.
     */
    public static function idPorCodigo(string $codigo): ?int
    {
        return Cache::rememberForever(
            "estado_reserva:id:{$codigo}",
            fn () => static::query()->where('codigo', $codigo)->value('id')
        );
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}