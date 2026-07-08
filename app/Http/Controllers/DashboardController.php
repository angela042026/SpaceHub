<?php

namespace App\Http\Controllers;

use App\Models\EstadoReserva;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $hoje = Carbon::today();
        $ontem = $hoje->copy()->subDay();

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->first();
        $estadoConfirmada = EstadoReserva::where('codigo', 'confirmada')->first();
        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->first();
        $idsAtivos = array_filter([optional($estadoPendente)->id, optional($estadoConfirmada)->id]);

        $totalReservas = Reserva::count();

        $totalSecretarias = Secretaria::where('ativo', true)
            ->where('reservavel', true)
            ->count();

        // Métricas de hoje vs. ontem, para as variações percentuais mostradas nos cards.
        $metricasHoje = $this->metricasDoDia($hoje, $idsAtivos, $estadoCancelada, $totalSecretarias);
        $metricasOntem = $this->metricasDoDia($ontem, $idsAtivos, $estadoCancelada, $totalSecretarias);

        $stats = [];
        foreach ($metricasHoje as $chave => $valor) {
            $stats[$chave] = [
                'value' => $valor,
                'changePercent' => $this->percentChange($valor, $metricasOntem[$chave]),
            ];
        }

        // Filtro de período (Geral / Semana / Mês) aplicado apenas às estatísticas agregadas.
        $periodo = $request->query('periodo', 'geral');
        $dataInicio = match ($periodo) {
            'semana' => Carbon::now()->startOfWeek(),
            'mes' => Carbon::now()->startOfMonth(),
            default => null,
        };

        $secretariasMaisUtilizadas = Reserva::selectRaw('secretaria_id, COUNT(*) as total')
            ->with('secretaria')
            ->when($dataInicio, fn ($q) => $q->where('data', '>=', $dataInicio))
            ->groupBy('secretaria_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $secretariasMenosUtilizadas = Secretaria::withCount(['reservas' => function ($q) use ($dataInicio) {
                $q->when($dataInicio, fn ($q2) => $q2->where('data', '>=', $dataInicio));
            }])
            ->where('ativo', true)
            ->where('reservavel', true)
            ->orderBy('reservas_count')
            ->take(5)
            ->get();

        $pisosPorUtilizacao = Reserva::selectRaw('pisos.id, pisos.nome, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->when($dataInicio, fn ($q) => $q->where('reservas.data', '>=', $dataInicio))
            ->groupBy('pisos.id', 'pisos.nome')
            ->orderByDesc('total')
            ->get();

        $utilizadoresComMaisReservas = Reserva::selectRaw('user_id, COUNT(*) as total')
            ->with('user')
            ->when($dataInicio, fn ($q) => $q->where('data', '>=', $dataInicio))
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $diasComMaiorOcupacao = Reserva::selectRaw('data, COUNT(*) as total')
            ->when($dataInicio, fn ($q) => $q->where('data', '>=', $dataInicio))
            ->groupBy('data')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // Reservas ativas de hoje, pré-carregadas de uma vez para evitar uma query por secretária.
        $reservasAtivasHoje = Reserva::whereDate('data', $hoje)
            ->whereIn('estado_reserva_id', $idsAtivos)
            ->with('periodo')
            ->get()
            ->groupBy('secretaria_id');

        $pisos = Piso::where('ativo', true)
            ->with([
                'setores' => fn ($query) => $query->where('ativo', true)->orderBy('id'),
                'setores.secretarias' => fn ($query) => $query->where('ativo', true)->where('reservavel', true),
            ])
            ->orderBy('numero')
            ->get()
            ->map(function ($piso) use ($reservasAtivasHoje) {
                $setores = $piso->setores->values()->map(function ($setor, $indice) use ($reservasAtivasHoje) {
                    $total = $setor->secretarias->count();
                    $ocupadas = $setor->secretarias
                        ->filter(fn ($secretaria) => in_array(
                            $this->statusDaSecretaria($secretaria, $reservasAtivasHoje->get($secretaria->id)),
                            ['ocupada', 'reservada', 'expira'],
                            true,
                        ))
                        ->count();

                    return [
                        'id' => $setor->id,
                        'numero' => $indice + 1,
                        'nome' => $setor->nome,
                        'codigo' => $setor->codigo,
                        'planta_x' => $setor->planta_x,
                        'planta_y' => $setor->planta_y,
                        'reservavel' => $setor->reservavel,
                        'totalSecretarias' => $total,
                        'ocupadas' => $ocupadas,
                        'livres' => max($total - $ocupadas, 0),
                        'status' => $this->estadoDoSetor($total, $ocupadas),
                    ];
                });

                return [
                    'id' => $piso->id,
                    'nome' => $piso->nome,
                    'codigo' => $piso->codigo,
                    'numero' => $piso->numero,
                    'planta' => $piso->planta,
                    'totalSecretarias' => $setores->sum('totalSecretarias'),
                    'setores' => $setores,
                ];
            });

        $reservaHojeUtilizador = Reserva::with([
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ])
            ->where('user_id', auth()->id())
            ->whereDate('data', $hoje)
            ->latest()
            ->first();

        $proximasReservas = Reserva::with([
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ])
            ->where('user_id', auth()->id())
            ->whereDate('data', '>=', $hoje)
            ->orderBy('data')
            ->take(5)
            ->get();

        $dados = [
            'pisos' => $pisos,
            'reservaHojeUtilizador' => $reservaHojeUtilizador,
            'proximasReservas' => $proximasReservas,
            'periodo' => $periodo,

            'stats' => [
                ...$stats,
                'totalReservas' => $totalReservas,
                'totalSecretarias' => $totalSecretarias,
            ],

            'estatisticas' => [
                'secretariasMaisUtilizadas' => $secretariasMaisUtilizadas,
                'secretariasMenosUtilizadas' => $secretariasMenosUtilizadas,
                'pisosPorUtilizacao' => $pisosPorUtilizacao,
                'pisoMaisUtilizado' => $pisosPorUtilizacao->first(),
                'utilizadoresComMaisReservas' => $utilizadoresComMaisReservas,
                'diasComMaiorOcupacao' => $diasComMaiorOcupacao,
            ],
        ];

        $role = optional(auth()->user()->role)->nome;

        if ($role === 'Administrador' || $role === 'Gestor') {
            return Inertia::render('Dashboard/Admin', $dados);
        }

        if ($role === 'Colaborador') {
            return Inertia::render('Dashboard/Funcionario', $dados);
        }

        return Inertia::render('Dashboard/Utilizador', $dados);
    }

    /**
     * Calcula as métricas-chave (reservas, check-ins, mesas livres, ocupação,
     * cancelamentos, expiradas) para um dado dia — usado para hoje e ontem.
     */
    private function metricasDoDia(Carbon $dia, array $idsAtivos, ?EstadoReserva $estadoCancelada, int $totalSecretarias): array
    {
        $reservas = Reserva::whereDate('data', $dia)->count();

        $checkins = Reserva::whereDate('data', $dia)
            ->whereNotNull('check_in_at')
            ->count();

        $cancelamentos = Reserva::whereDate('data', $dia)
            ->where('estado_reserva_id', optional($estadoCancelada)->id)
            ->count();

        $expiradas = Reserva::whereDate('data', $dia)
            ->whereHas('estadoReserva', fn ($q) => $q->where('codigo', 'expirada'))
            ->count();

        $secretariasOcupadas = Reserva::whereDate('data', $dia)
            ->whereIn('estado_reserva_id', $idsAtivos)
            ->distinct('secretaria_id')
            ->count('secretaria_id');

        $mesasLivres = max($totalSecretarias - $secretariasOcupadas, 0);

        $taxaOcupacao = $totalSecretarias > 0
            ? round(($secretariasOcupadas / $totalSecretarias) * 100)
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

    private function percentChange(int $atual, int $anterior): ?float
    {
        if ($anterior === 0) {
            return null;
        }

        return round((($atual - $anterior) / $anterior) * 100, 1);
    }

    /**
     * Estado de uma secretária no mapa de ocupação (5 estados, alinhado com a legenda).
     */
    private function statusDaSecretaria(Secretaria $secretaria, $reservasAtivas): string
    {
        if (! $secretaria->ativo || ! $secretaria->reservavel) {
            return 'indisponivel';
        }

        $reserva = $reservasAtivas?->first();

        if (! $reserva) {
            return 'livre';
        }

        if ($reserva->check_in_at !== null) {
            return 'ocupada';
        }

        $inicioPeriodo = Carbon::parse($reserva->data->format('Y-m-d').' '.$reserva->periodo?->hora_inicio);

        if (now()->between($inicioPeriodo->copy()->subMinutes(30), $inicioPeriodo->copy()->addMinutes(30))) {
            return 'expira';
        }

        return 'reservada';
    }

    /**
     * Estado agregado de um setor/zona no mapa, com base na % de secretárias ocupadas.
     */
    private function estadoDoSetor(int $total, int $ocupadas): string
    {
        if ($total === 0) {
            return 'indisponivel';
        }

        if ($ocupadas === 0) {
            return 'livre';
        }

        if ($ocupadas / $total >= 0.8) {
            return 'ocupada';
        }

        return 'reservada';
    }
}
