<?php

namespace App\Http\Controllers;

use App\Models\EstadoReserva;
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

        $user = auth()->user();
        $role = optional($user->role)->nome;

        $dados = [
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
                'utilizadoresComMaisReservas' => $utilizadoresComMaisReservas,
                'diasComMaiorOcupacao' => $diasComMaiorOcupacao,
            ],
        ];

        if ($role === 'Administrador' || $role === 'Gestor') {
            return Inertia::render('Dashboard/Admin', $dados);
        }

        if ($role === 'Colaborador') {
            return Inertia::render('Dashboard/Funcionario', $dados);
        }

        return Inertia::render('Dashboard/Utilizador', $dados);

    }
}
