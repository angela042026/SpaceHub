<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class DashboardMetricsService
{
    private const CACHE_TTL_SEGUNDOS = 60;

    public function idsEstadosAtivos(): array
    {
        return EstadoReserva::idsAtivos();
    }

    /**
     * Estas contagens repetem-se a cada visita ao dashboard (14+ queries).
     * Ficam em cache por pouco tempo — a janela é limitada precisamente
     * porque quem provoca uma alteração real (reserva, check-in,
     * cancelamento) invalida a cache de imediato via
     * limparCacheDoDia(), veja-se os pontos que despoletam
     * broadcast(new MapaAtualizado()).
     */
    public function obterStats(Carbon $hoje): array
    {
        return Cache::remember(
            $this->chaveCacheStats($hoje),
            self::CACHE_TTL_SEGUNDOS,
            fn () => $this->calcularStats($hoje)
        );
    }

    /**
     * Invalida a cache de stats do dia. Chamar sempre que uma reserva
     * mudar de estado (criada, cancelada, check-in, expirada) — os
     * mesmos pontos que já despoletam broadcast(new MapaAtualizado()).
     */
    public static function limparCacheDoDia(): void
    {
        Cache::forget('dashboard:stats:' . Carbon::today()->toDateString());
    }

    private function chaveCacheStats(Carbon $hoje): string
    {
        return 'dashboard:stats:' . $hoje->toDateString();
    }

    private function calcularStats(Carbon $hoje): array
    {
        $ontem = $hoje->copy()->subDay();

        $idsEstadosAtivos = $this->idsEstadosAtivos();

        $estadoCanceladaId = EstadoReserva::query()
            ->where('codigo', 'cancelada')
            ->value('id');

        $estadoExpiradaId = EstadoReserva::query()
            ->where('codigo', 'expirada')
            ->value('id');

        $totalSecretarias = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->count();

        $metricasHoje = $this->metricasDoDia(
            $hoje,
            $idsEstadosAtivos,
            $estadoCanceladaId,
            $estadoExpiradaId,
            $totalSecretarias
        );

        $metricasOntem = $this->metricasDoDia(
            $ontem,
            $idsEstadosAtivos,
            $estadoCanceladaId,
            $estadoExpiradaId,
            $totalSecretarias
        );

        $stats = [];

        foreach ($metricasHoje as $chave => $valor) {
            $stats[$chave] = [
                'value' => $valor,
                'changePercent' => $this->percentChange(
                    $valor,
                    $metricasOntem[$chave]
                ),
            ];
        }

        $idsEstadosValidosEstatisticas = EstadoReserva::idsValidos();

        $totalReservas = Reserva::query()
            ->whereIn('estado_reserva_id', $idsEstadosValidosEstatisticas)
            ->count();

        return [
            ...$stats,
            'totalReservas' => $totalReservas,
            'totalSecretarias' => $totalSecretarias,
        ];
    }

    public function obterAtividadeRecente(): array
    {
        $limite = config('reservas.dashboard.atividade_recente');

        $criadas = Reserva::query()
            ->with(['user', 'secretaria'])
            ->latest('created_at')
            ->take($limite)
            ->get()
            ->map(fn (Reserva $reserva) => [
                'id' => "criada-{$reserva->id}",
                'tipo' => 'criada',
                'utilizador' => $reserva->user?->name,
                'secretaria' => $reserva->secretaria?->codigo,
                'timestamp' => $reserva->created_at,
            ]);

        $checkins = Reserva::query()
            ->with(['user', 'secretaria'])
            ->whereNotNull('check_in_at')
            ->latest('check_in_at')
            ->take($limite)
            ->get()
            ->map(fn (Reserva $reserva) => [
                'id' => "checkin-{$reserva->id}",
                'tipo' => 'checkin',
                'utilizador' => $reserva->user?->name,
                'secretaria' => $reserva->secretaria?->codigo,
                'timestamp' => $reserva->check_in_at,
            ]);

        $canceladas = Reserva::query()
            ->with(['user', 'secretaria'])
            ->whereNotNull('cancelada_at')
            ->latest('cancelada_at')
            ->take($limite)
            ->get()
            ->map(fn (Reserva $reserva) => [
                'id' => "cancelada-{$reserva->id}",
                'tipo' => 'cancelada',
                'utilizador' => $reserva->user?->name,
                'secretaria' => $reserva->secretaria?->codigo,
                'timestamp' => $reserva->cancelada_at,
            ]);

        return $criadas
            ->concat($checkins)
            ->concat($canceladas)
            ->sortByDesc('timestamp')
            ->take($limite)
            ->values()
            ->map(fn (array $evento) => [
                ...$evento,
                'timestamp' => $evento['timestamp']->toIso8601String(),
            ])
            ->all();
    }

    private function metricasDoDia(
        Carbon $dia,
        array $idsEstadosAtivos,
        ?int $estadoCanceladaId,
        ?int $estadoExpiradaId,
        int $totalSecretarias
    ): array {
        $reservas = Reserva::query()
            ->noIntervalo($dia)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->count();

        $checkins = Reserva::query()
            ->noIntervalo($dia)
            ->whereNotNull('check_in_at')
            ->count();

        $cancelamentos = $estadoCanceladaId
            ? Reserva::query()
                ->noIntervalo($dia)
                ->where(
                    'estado_reserva_id',
                    $estadoCanceladaId
                )
                ->count()
            : 0;

        $expiradas = $estadoExpiradaId
            ? Reserva::query()
                ->noIntervalo($dia)
                ->where(
                    'estado_reserva_id',
                    $estadoExpiradaId
                )
                ->count()
            : 0;

        $secretariasOcupadas = Reserva::query()
            ->noIntervalo($dia)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->distinct()
            ->count('secretaria_id');

        $mesasLivres = max(
            $totalSecretarias - $secretariasOcupadas,
            0
        );

        $taxaOcupacao = $totalSecretarias > 0
            ? (int) round(
                ($secretariasOcupadas / $totalSecretarias) * 100
            )
            : 0;

        return [
            'reservasHoje' => $reservas,
            'checkinsHoje' => $checkins,
            'cancelamentosHoje' => $cancelamentos,
            'reservasExpiradasHoje' => $expiradas,
            'mesasLivres' => $mesasLivres,
            'taxaOcupacao' => $taxaOcupacao,
        ];
    }

    private function percentChange(
        int|float $atual,
        int|float $anterior
    ): ?float {
        if ($anterior == 0) {
            return null;
        }

        return round(
            (($atual - $anterior) / $anterior) * 100,
            1
        );
    }
}
