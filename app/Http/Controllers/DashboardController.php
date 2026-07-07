<?php

namespace App\Http\Controllers;

use App\Models\EstadoReserva;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $hoje = Carbon::today();

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->first();
        $estadoConfirmada = EstadoReserva::where('codigo', 'confirmada')->first();
        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->first();

        $totalReservas = Reserva::count();

        $reservasHoje = Reserva::whereDate('data', $hoje)->count();

        $checkinsHoje = Reserva::whereDate('data', $hoje)
            ->whereNotNull('check_in_at')
            ->count();

        $cancelamentosHoje = Reserva::whereDate('data', $hoje)
            ->where('estado_reserva_id', optional($estadoCancelada)->id)
            ->count();

        $totalSecretarias = Secretaria::where('ativo', true)
            ->where('reservavel', true)
            ->count();

        $secretariasOcupadasHoje = Reserva::whereDate('data', $hoje)
            ->whereIn('estado_reserva_id', array_filter([
                optional($estadoPendente)->id,
                optional($estadoConfirmada)->id,
            ]))
            ->distinct('secretaria_id')
            ->count('secretaria_id');

        $mesasLivres = max($totalSecretarias - $secretariasOcupadasHoje, 0);

        $taxaOcupacao = $totalSecretarias > 0
            ? round(($secretariasOcupadasHoje / $totalSecretarias) * 100)
            : 0;

        $secretariasMaisUtilizadas = Reserva::selectRaw('secretaria_id, COUNT(*) as total')
            ->with('secretaria')
            ->groupBy('secretaria_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $secretariasMenosUtilizadas = Secretaria::withCount('reservas')
            ->where('ativo', true)
            ->where('reservavel', true)
            ->orderBy('reservas_count')
            ->take(5)
            ->get();

        $pisoMaisUtilizado = Reserva::selectRaw('pisos.id, pisos.nome, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->groupBy('pisos.id', 'pisos.nome')
            ->orderByDesc('total')
            ->first();

        $utilizadoresComMaisReservas = Reserva::selectRaw('user_id, COUNT(*) as total')
            ->with('user')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $diasComMaiorOcupacao = Reserva::selectRaw('data, COUNT(*) as total')
            ->groupBy('data')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $pisos = Piso::where('ativo', true)
            ->with([
                'setores.secretarias' => function ($query) {
                    $query->where('ativo', true)
                        ->where('reservavel', true);
                },
            ])
            ->orderBy('numero')
            ->get()
            ->map(function ($piso) use ($hoje, $estadoPendente, $estadoConfirmada) {
                $secretarias = $piso->setores
                    ->flatMap(function ($setor) use ($hoje, $estadoPendente, $estadoConfirmada) {
                        return $setor->secretarias->map(function ($secretaria) use ($setor, $hoje, $estadoPendente, $estadoConfirmada) {
                            $temReservaAtiva = Reserva::where('secretaria_id', $secretaria->id)
                                ->whereDate('data', $hoje)
                                ->whereIn('estado_reserva_id', array_filter([
                                    optional($estadoPendente)->id,
                                    optional($estadoConfirmada)->id,
                                ]))
                                ->exists();

                            return [
                                'id' => $secretaria->id,
                                'codigo' => $secretaria->codigo,
                                'setor' => $setor->nome,
                                'planta_x' => $secretaria->planta_x,
                                'planta_y' => $secretaria->planta_y,
                                'status' => $temReservaAtiva ? 'ocupada' : 'livre',
                            ];
                        });
                    })
                    ->values();

                return [
                    'id' => $piso->id,
                    'nome' => $piso->nome,
                    'codigo' => $piso->codigo,
                    'numero' => $piso->numero,
                    'planta' => $piso->planta,
                    'secretarias' => $secretarias,
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

        $dados = [
            'pisos' => $pisos,

            'reservaHojeUtilizador' => $reservaHojeUtilizador,

            'stats' => [
                'totalReservas' => $totalReservas,
                'reservasHoje' => $reservasHoje,
                'checkinsHoje' => $checkinsHoje,
                'cancelamentosHoje' => $cancelamentosHoje,
                'totalSecretarias' => $totalSecretarias,
                'mesasLivres' => $mesasLivres,
                'taxaOcupacao' => $taxaOcupacao,
            ],

            'estatisticas' => [
                'secretariasMaisUtilizadas' => $secretariasMaisUtilizadas,
                'secretariasMenosUtilizadas' => $secretariasMenosUtilizadas,
                'pisoMaisUtilizado' => $pisoMaisUtilizado,
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
}
