<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Periodo;
use App\Models\EstadoReserva;
use App\Models\Setor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReservaController extends Controller
{
    /**
     * Listar as reservas do utilizador autenticado.
     */
    public function index(Request $request)
    {
        $query = Reserva::where('user_id', Auth::id())
            ->with([
                'secretaria.setor',
                'periodo',
                'estadoReserva',
            ]);

        // Filtrar por estado
        if ($request->filled('estado')) {
            $query->whereHas('estadoReserva', function ($q) use ($request) {
                $q->where('codigo', $request->estado);
            });
        }

        // Filtrar por data
        if ($request->filled('data')) {
            $query->whereDate('data', $request->data);
        }

        // Filtrar por setor
        if ($request->filled('setor')) {
            $query->whereHas('secretaria.setor', function ($q) use ($request) {
                $q->where('id', $request->setor);
            });
        }

        $reservas = $query
            ->orderBy('data', 'desc')
            ->get();

        $setores = Setor::where('reservavel', true)
            ->orderBy('nome')
            ->get();

        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas,
            'setores' => $setores,
            'filters' => $request->only([
                'estado',
                'data',
                'setor',
            ]),
        ]);
    }

    /**
     * Mostrar o formulário de nova reserva.
     */
    public function create(Request $request)
    {
        // Obtém os períodos ativos
        $periodos = Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();

        // Obtém as secretárias reserváveis e ativas
        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true);

        // Se já foi escolhida uma data e um período,
        // apresentar apenas as secretárias disponíveis
        if ($request->filled('data') && $request->filled('periodo_id')) {

            $secretariasReservadas = Reserva::where('data', $request->data)
                ->where('periodo_id', $request->periodo_id)
                ->whereNull('cancelada_at')
                ->pluck('secretaria_id');

            $secretarias->whereNotIn('id', $secretariasReservadas);
        }

        return Inertia::render('Reservas/Create', [
            'secretarias' => $secretarias
                ->orderBy('codigo')
                ->get(),

            'periodos' => $periodos,

            'filters' => $request->only([
                'data',
                'periodo_id',
            ]),
        ]);
    }

    /**
     * Guardar uma nova reserva.
     */
    public function store(Request $request)
    {
        // Validar os dados recebidos
        $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        // Verifica se a secretária já está reservada
        $reservaExistente = Reserva::where('secretaria_id', $request->secretaria_id)
            ->where('data', $request->data)
            ->where('periodo_id', $request->periodo_id)
            ->whereNull('cancelada_at')
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors([
                    'secretaria_id' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
                ])
                ->withInput();
        }

        // Verifica se o utilizador já possui uma reserva
        // para a mesma data e período
        $reservaUtilizador = Reserva::where('user_id', Auth::id())
            ->where('data', $request->data)
            ->where('periodo_id', $request->periodo_id)
            ->whereNull('cancelada_at')
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors([
                    'data' => 'Já possui uma reserva para esta data e período.',
                ])
                ->withInput();
        }

        // Obtém o estado "Pendente"
        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->firstOrFail();

        // Cria a reserva
        Reserva::create([
            'user_id' => Auth::id(),
            'secretaria_id' => $request->secretaria_id,
            'periodo_id' => $request->periodo_id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $request->data,
            'observacoes' => $request->observacoes,
        ]);

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva criada com sucesso.');
    }

    /**
     * Cancelar uma reserva.
     */
    public function destroy(string $id)
    {
        // Obtém a reserva do utilizador autenticado
        $reserva = Reserva::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Verifica se a reserva já foi cancelada
        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', 'Esta reserva já se encontra cancelada.');
        }

        // Obtém o estado "Cancelada"
        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->firstOrFail();

        // Atualiza a reserva
        $reserva->update([
            'estado_reserva_id' => $estadoCancelada->id,
            'cancelada_at' => now(),
        ]);

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva cancelada com sucesso.');
    }

    /**
     * Histórico de reservas.
     */
    public function history()
    {
        //
    }

    /**
     * Consultar disponibilidade das secretárias.
     */
    public function availability(Request $request)
    {
        // Validar os dados recebidos
        $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
        ]);

        // Obtém as secretárias já reservadas
        $secretariasReservadas = Reserva::where('data', $request->data)
            ->where('periodo_id', $request->periodo_id)
            ->whereNull('cancelada_at')
            ->pluck('secretaria_id');

        // Obtém apenas as secretárias disponíveis
        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();

        return response()->json($secretarias);
    }
}
