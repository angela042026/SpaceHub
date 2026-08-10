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

    /**
     * Taxa de ocupação (%) de cada um dos últimos $dias dias (hoje
     * incluído) e do período equivalente imediatamente anterior, para o
     * gráfico "Evolução da Ocupação" do dashboard — usa a mesma
     * definição de ocupação que obterStats() (secretárias com reserva
     * ativa nesse dia, sobre o total de secretárias reserváveis),
     * opcionalmente restrita a um piso.
     */
    public function obterTendenciaOcupacaoComparativa(
        Carbon $hoje,
        int $dias = 7,
        ?int $pisoId = null
    ): array {
        $chave = sprintf(
            'dashboard:tendencia:%s:%d:%s',
            $hoje->toDateString(),
            $dias,
            $pisoId ?? 'todos'
        );

        return Cache::remember(
            $chave,
            self::CACHE_TTL_SEGUNDOS,
            fn () => $this->calcularTendenciaComparativa($hoje, $dias, $pisoId)
        );
    }

    private function calcularTendenciaComparativa(
        Carbon $hoje,
        int $dias,
        ?int $pisoId
    ): array {
        $totalSecretarias = $this->contarSecretarias($pisoId);
        $idsEstadosAtivos = $this->idsEstadosAtivos();

        $diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        $atual = [];
        $anterior = [];

        for ($offset = $dias - 1; $offset >= 0; $offset--) {
            $diaAtual = $hoje->copy()->subDays($offset);
            $diaAnterior = $diaAtual->copy()->subDays($dias);

            $label = $dias <= 7
                ? $diasSemana[$diaAtual->dayOfWeek]
                : $diaAtual->format('d/m');

            $atual[] = [
                'dia' => $label,
                'ocupacao' => $this->calcularOcupacaoDoDia(
                    $diaAtual,
                    $idsEstadosAtivos,
                    $totalSecretarias,
                    $pisoId
                ),
            ];

            $anterior[] = [
                'dia' => $label,
                'ocupacao' => $this->calcularOcupacaoDoDia(
                    $diaAnterior,
                    $idsEstadosAtivos,
                    $totalSecretarias,
                    $pisoId
                ),
            ];
        }

        $valoresAtuais = array_column($atual, 'ocupacao');
        $valoresAnteriores = array_column($anterior, 'ocupacao');

        $media = $valoresAtuais
            ? (int) round(array_sum($valoresAtuais) / count($valoresAtuais))
            : 0;

        $mediaAnterior = $valoresAnteriores
            ? array_sum($valoresAnteriores) / count($valoresAnteriores)
            : 0;

        return [
            'atual' => $atual,
            'anterior' => $anterior,
            'media' => $media,
            'pico' => $valoresAtuais ? max($valoresAtuais) : 0,
            'minimo' => $valoresAtuais ? min($valoresAtuais) : 0,
            'variacaoPP' => round($media - $mediaAnterior, 1),
        ];
    }

    private function contarSecretarias(?int $pisoId): int
    {
        return Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->when(
                $pisoId,
                fn ($query) => $query->whereHas(
                    'setor',
                    fn ($setorQuery) => $setorQuery->where('piso_id', $pisoId)
                )
            )
            ->count();
    }

    private function calcularOcupacaoDoDia(
        Carbon $dia,
        array $idsEstadosAtivos,
        int $totalSecretarias,
        ?int $pisoId
    ): int {
        $secretariasOcupadas = Reserva::query()
            ->noIntervalo($dia)
            ->whereIn('estado_reserva_id', $idsEstadosAtivos)
            ->when(
                $pisoId,
                fn ($query) => $query->whereHas(
                    'secretaria.setor',
                    fn ($setorQuery) => $setorQuery->where('piso_id', $pisoId)
                )
            )
            ->distinct()
            ->count('secretaria_id');

        return $totalSecretarias > 0
            ? (int) round(($secretariasOcupadas / $totalSecretarias) * 100)
            : 0;
    }

    /**
     * Total de reservas confirmadas por piso nos últimos $dias dias, e o
     * mesmo total no período equivalente imediatamente anterior — para o
     * gráfico de barras "Reservas por piso" do dashboard.
     */
    public function obterReservasPorPisoComparativo(
        Carbon $hoje,
        int $dias = 30
    ): array {
        $chave = sprintf(
            'dashboard:reservas-por-piso:%s:%d',
            $hoje->toDateString(),
            $dias
        );

        return Cache::remember(
            $chave,
            self::CACHE_TTL_SEGUNDOS,
            fn () => $this->calcularReservasPorPisoComparativo($hoje, $dias)
        );
    }

    private function calcularReservasPorPisoComparativo(
        Carbon $hoje,
        int $dias
    ): array {
        $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');

        $inicioAtual = $hoje->copy()->subDays($dias - 1);
        $fimAnterior = $inicioAtual->copy()->subDay();
        $inicioAnterior = $fimAnterior->copy()->subDays($dias - 1);

        $contarPorPiso = function (Carbon $inicio, Carbon $fim) use ($estadoConfirmadaId) {
            return Reserva::query()
                ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
                ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
                ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
                ->whereDate('reservas.data', '>=', $inicio)
                ->whereDate('reservas.data', '<=', $fim)
                ->where('reservas.estado_reserva_id', $estadoConfirmadaId)
                ->whereNull('reservas.cancelada_at')
                ->select(['pisos.id', 'pisos.nome'])
                ->selectRaw('COUNT(reservas.id) as total')
                ->groupBy('pisos.id', 'pisos.nome')
                ->get()
                ->keyBy('id');
        };

        $atuais = $contarPorPiso($inicioAtual, $hoje);
        $anteriores = $contarPorPiso($inicioAnterior, $fimAnterior);

        // Um piso pode ter reservas só no período anterior (ex: esteve
        // parado este mês) — juntar as duas coleções por id em vez de
        // mapear só sobre $atuais, senão a barra "anterior" desse piso
        // nunca chega a aparecer no gráfico.
        $pisos = $atuais
            ->values()
            ->concat(
                $anteriores
                    ->whereNotIn('id', $atuais->keys()->all())
                    ->values()
            )
            ->map(fn ($piso) => [
                'id' => $piso->id,
                'nome' => $piso->nome,
                'atual' => (int) ($atuais->get($piso->id)->total ?? 0),
                'anterior' => (int) ($anteriores->get($piso->id)->total ?? 0),
            ])
            ->sortByDesc('atual')
            ->values();

        $total = (int) $pisos->sum('atual');

        $pisoDestaque = $pisos->first();

        return [
            'pisos' => $pisos->all(),
            'total' => $total,
            'pisoDestaque' => $pisoDestaque && $total > 0
                ? [
                    'nome' => $pisoDestaque['nome'],
                    'percentual' => (int) round(
                        ($pisoDestaque['atual'] / $total) * 100
                    ),
                ]
                : null,
        ];
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
                'utilizadorFoto' => $reserva->user?->fotografia_url,
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
                'utilizadorFoto' => $reserva->user?->fotografia_url,
                'timestamp' => $reserva->check_in_at,
            ]);

        /*
         * cancelada_at é partilhado por dois estados finais diferentes
         * (cancelada e expirada — ver CancelarReservasExpiradas). Sem
         * separar por estado_reserva_id aqui, uma reserva expirada
         * aparecia na atividade recente como "cancelou", o que confunde
         * quem está a ler o feed.
         */
        $estadoCanceladaId = EstadoReserva::idPorCodigo('cancelada');
        $estadoExpiradaId = EstadoReserva::idPorCodigo('expirada');

        $canceladas = Reserva::query()
            ->with(['user', 'secretaria'])
            ->whereNotNull('cancelada_at')
            ->where('estado_reserva_id', $estadoCanceladaId)
            ->latest('cancelada_at')
            ->take($limite)
            ->get()
            ->map(fn (Reserva $reserva) => [
                'id' => "cancelada-{$reserva->id}",
                'tipo' => 'cancelada',
                'utilizador' => $reserva->user?->name,
                'secretaria' => $reserva->secretaria?->codigo,
                'utilizadorFoto' => $reserva->user?->fotografia_url,
                'timestamp' => $reserva->cancelada_at,
            ]);

        $expiradas = Reserva::query()
            ->with(['user', 'secretaria'])
            ->whereNotNull('cancelada_at')
            ->where('estado_reserva_id', $estadoExpiradaId)
            ->latest('cancelada_at')
            ->take($limite)
            ->get()
            ->map(fn (Reserva $reserva) => [
                'id' => "expirada-{$reserva->id}",
                'tipo' => 'expirada',
                'utilizador' => $reserva->user?->name,
                'secretaria' => $reserva->secretaria?->codigo,
                'utilizadorFoto' => $reserva->user?->fotografia_url,
                'timestamp' => $reserva->cancelada_at,
            ]);

        return $criadas
            ->concat($checkins)
            ->concat($canceladas)
            ->concat($expiradas)
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
