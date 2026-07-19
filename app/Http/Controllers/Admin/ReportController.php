<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EstadoReserva;
use App\Models\PedidoSuporte;
use App\Models\Reserva;
use App\Models\Role;
use App\Models\Setor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private const LIMITE_LINHAS = 500;

    public function index(): Response
    {
        Gate::authorize('viewAny', Setor::class);

        return Inertia::render('Admin/Reports/Index');
    }

    public function reservas(Request $request): Response
    {
        Gate::authorize('viewAny', Setor::class);

        $query = Reserva::query()
            ->with(['user', 'secretaria.setor.piso.edificio', 'periodo', 'estadoReserva']);

        if ($request->filled('data_inicio')) {
            $query->whereDate('data', '>=', $request->input('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data', '<=', $request->input('data_fim'));
        }

        if ($request->filled('estado_reserva_id')) {
            $query->where('estado_reserva_id', $request->integer('estado_reserva_id'));
        }

        $reservas = $query
            ->orderByDesc('data')
            ->limit(self::LIMITE_LINHAS)
            ->get();

        return Inertia::render('Admin/Reports/Reservas', [
            'reservas' => $reservas,
            'estados' => EstadoReserva::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['data_inicio', 'data_fim', 'estado_reserva_id']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function utilizadores(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $query = User::query()->with('role');

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $utilizadores = $query
            ->orderBy('name')
            ->limit(self::LIMITE_LINHAS)
            ->get();

        return Inertia::render('Admin/Reports/Utilizadores', [
            'utilizadores' => $utilizadores,
            'roles' => Role::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['role_id', 'ativo']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function suporte(Request $request): Response
    {
        Gate::authorize('viewAny', Setor::class);

        $query = PedidoSuporte::query()->with('user');

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $pedidos = $query
            ->orderByDesc('created_at')
            ->limit(self::LIMITE_LINHAS)
            ->get();

        return Inertia::render('Admin/Reports/Suporte', [
            'pedidos' => $pedidos,
            'filters' => $request->only(['estado']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }
}
