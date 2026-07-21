<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Services\EstatisticasService;
use App\Services\MapaOcupacaoService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const ESTADOS_ATIVOS = [
        'pendente',
        'confirmada',
    ];

    public function __construct(
        private readonly MapaOcupacaoService $mapaOcupacaoService,
        private readonly EstatisticasService $estatisticasService,
    ) {
    }

    public function index(DashboardRequest $request): Response
    {
        $hoje = Carbon::today();
        $ontem = $hoje->copy()->subDay();

        $periodo = $request->validated('periodo', 'geral');
        $dataInicio = $this->estatisticasService->obterDataInicio($periodo);

        $idsEstadosAtivos = EstadoReserva::query()
            ->whereIn('codigo', self::ESTADOS_ATIVOS)
            ->pluck('id')
            ->all();

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

        $idsEstadosValidosEstatisticas = EstadoReserva::query()
            ->whereIn('codigo', ['pendente', 'confirmada', 'concluida'])
            ->pluck('id')
            ->all();

        $totalReservas = Reserva::query()
            ->whereIn('estado_reserva_id', $idsEstadosValidosEstatisticas)
            ->count();

        $estatisticas = $this->estatisticasService->obterEstatisticas($dataInicio);
        $atividadeRecente = $this->obterAtividadeRecente();

        ['pisos' => $pisos, 'edificios' => $edificios] = $this->mapaOcupacaoService->obterDados();

        $reservaHojeUtilizador = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where('user_id', $request->user()->id)
            ->whereDate('data', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->orderBy('periodo_id')
            ->first();

        $proximasReservas = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where('user_id', $request->user()->id)
            ->whereDate('data', '>', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->orderBy('data')
            ->orderBy('periodo_id')
            ->take(5)
            ->get();

        $dados = [
            'pisos' => $pisos,
            'edificios' => $edificios,
            'reservaHojeUtilizador' => $reservaHojeUtilizador,
            'proximasReservas' => $proximasReservas,
            'periodo' => $periodo,

            'stats' => [
                ...$stats,
                'totalReservas' => $totalReservas,
                'totalSecretarias' => $totalSecretarias,
            ],

            'estatisticas' => $estatisticas,
            'atividadeRecente' => $atividadeRecente,
        ];

        $role = $request->user()->role?->nome;

        if (in_array($role, ['Administrador', 'Gestor'], true)) {
            return Inertia::render('Dashboard/Admin', $dados);
        }

        if ($role === 'Colaborador') {
            return Inertia::render(
                'Dashboard/Funcionario',
                $dados
            );
        }

        return Inertia::render('Dashboard/Utilizador', $dados);
    }

    private function metricasDoDia(
        Carbon $dia,
        array $idsEstadosAtivos,
        ?int $estadoCanceladaId,
        ?int $estadoExpiradaId,
        int $totalSecretarias
    ): array {
        $reservas = Reserva::query()
            ->whereDate('data', $dia)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->count();

        $checkins = Reserva::query()
            ->whereDate('data', $dia)
            ->whereNotNull('check_in_at')
            ->count();

        $cancelamentos = $estadoCanceladaId
            ? Reserva::query()
                ->whereDate('data', $dia)
                ->where(
                    'estado_reserva_id',
                    $estadoCanceladaId
                )
                ->count()
            : 0;

        $expiradas = $estadoExpiradaId
            ? Reserva::query()
                ->whereDate('data', $dia)
                ->where(
                    'estado_reserva_id',
                    $estadoExpiradaId
                )
                ->count()
            : 0;

        $secretariasOcupadas = Reserva::query()
            ->whereDate('data', $dia)
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

    private function obterAtividadeRecente(): array
    {
        $criadas = Reserva::query()
            ->with(['user', 'secretaria'])
            ->latest('created_at')
            ->take(8)
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
            ->take(8)
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
            ->take(8)
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
            ->take(8)
            ->values()
            ->map(fn (array $evento) => [
                ...$evento,
                'timestamp' => $evento['timestamp']->toIso8601String(),
            ])
            ->all();
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