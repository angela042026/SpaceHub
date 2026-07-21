<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Periodo;
use App\Models\EstadoReserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Setor;
use App\Models\Piso;

class ReservaController extends Controller
{
    /**
     * Listar as reservas do utilizador autenticado.
     */
    public function index(Request $request)
    {
        $query = Reserva::where('user_id', Auth::id())
            ->whereNotNull('secretaria_id')
            ->with([
                'secretaria',
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
        // Períodos ativos
        $periodos = Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();

        // Pisos ativos
        $pisos = Piso::where('ativo', true)
            ->orderBy('numero')
            ->get();

        // Tipos de espaço (setores)
        $setores = Setor::where('reservavel', true)
            ->with('piso')
            ->orderBy('piso_id')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Reservas/Create', [
            'periodos' => $periodos,
            'pisos' => $pisos,
            'setores' => $setores,

            'filters' => $request->only([
                'data',
                'periodo_id',
                'piso_id',
                'setor_id',
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
            ->whereDate('data', $request->data)
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
            ->whereDate('data', $request->data)
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
    public function cancelar(Reserva $reserva)
    {
        if ($reserva->user_id !== Auth::id()) {
            abort(403, 'Esta reserva não te pertence.');
        }
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
     * Mostrar o formulário de edição de uma reserva.
     */
    public function edit(Reserva $reserva)
    {
        if ($reserva->user_id !== Auth::id()) {
            abort(403, 'Esta reserva não te pertence.');
        }

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', 'Não é possível alterar uma reserva cancelada.');
        }

        $periodos = Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();

        $pisos = Piso::where('ativo', true)
            ->orderBy('numero')
            ->get();

        $setores = Setor::where('reservavel', true)
            ->with('piso')
            ->orderBy('piso_id')
            ->orderBy('nome')
            ->get();

        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->with('setor.piso')
            ->orderBy('codigo')
            ->get();

        return Inertia::render('Reservas/Edit', [
            'reserva' => $reserva->load('secretaria.setor.piso'),
            'periodos' => $periodos,
            'pisos' => $pisos,
            'setores' => $setores,
            'secretarias' => $secretarias,
        ]);
    }



    /**
     * Atualizar uma reserva existente.
     */
    public function update(Request $request, Reserva $reserva)
    {
        if ($reserva->user_id !== Auth::id()) {
            abort(403, 'Esta reserva não te pertence.');
        }

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', 'Não é possível alterar uma reserva cancelada.');
        }

        $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        // Verifica se outra reserva já ocupa a secretária na data e período
        $reservaExistente = Reserva::where('secretaria_id', $request->secretaria_id)
            ->whereDate('data', $request->data)
            ->where('periodo_id', $request->periodo_id)
            ->whereNull('cancelada_at')
            ->where('id', '!=', $reserva->id)
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors([
                    'secretaria_id' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
                ])
                ->withInput();
        }

        // Verifica se o utilizador já tem outra reserva na mesma data e período
        $reservaUtilizador = Reserva::where('user_id', Auth::id())
            ->whereDate('data', $request->data)
            ->where('periodo_id', $request->periodo_id)
            ->whereNull('cancelada_at')
            ->where('id', '!=', $reserva->id)
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors([
                    'data' => 'Já possui uma reserva para esta data e período.',
                ])
                ->withInput();
        }

        $reserva->update([
            'data' => $request->data,
            'periodo_id' => $request->periodo_id,
            'secretaria_id' => $request->secretaria_id,
            'observacoes' => $request->observacoes,
        ]);

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva atualizada com sucesso.');
    }

    /**
     * Histórico de reservas passadas do utilizador autenticado, paginado.
     */
    public function history(Request $request)
    {
        $reservas = Reserva::where('user_id', Auth::id())
            ->whereDate('data', '<', now()->toDateString())
            ->with([
                'secretaria.setor',
                'periodo',
                'estadoReserva',
            ])
            ->orderBy('data', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Reservas/History', [
            'reservas' => $reservas,
        ]);
    }

    /**
     * Consultar disponibilidade dos lugares.
     *
     * Usado tanto pela consulta em direto do formulário de criação (JSON)
     * como pela página dedicada de consulta de disponibilidade (Inertia).
     */
    public function availability(Request $request)
    {
        if ($request->wantsJson()) {

            $request->validate([
                'data' => ['required', 'date'],
                'periodo_id' => ['required', 'exists:periodos,id'],
                'setor_id' => ['required', 'exists:setores,id'],
            ]);

            return response()->json(
                $this->secretariasDisponiveis(
                    $request->data,
                    $request->periodo_id,
                    $request->setor_id
                )
            );
        }

        $periodos = Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();

        $secretariasDisponiveis = null;

        if (
            $request->filled('data') &&
            $request->filled('periodo_id') &&
            $request->filled('setor_id')
        ) {

            $request->validate([
                'data' => ['required', 'date'],
                'periodo_id' => ['required', 'exists:periodos,id'],
                'setor_id' => ['required', 'exists:setores,id'],
            ]);

            $secretariasDisponiveis = $this->secretariasDisponiveis(
                $request->data,
                $request->periodo_id,
                $request->setor_id
            )->load('setor.piso.edificio');
        }

        return Inertia::render('Reservas/Availability', [
            'periodos' => $periodos,
            'secretariasDisponiveis' => $secretariasDisponiveis,
            'filters' => $request->only([
                'data',
                'periodo_id',
                'setor_id',
            ]),
        ]);
    }




    /**
     * Lugares reserváveis e ativos sem reserva ativa numa data/período.
     */
    private function secretariasDisponiveis(
        string $data,
        int|string $periodoId,
        int|string $setorId
    ) {
        $secretariasReservadas = Reserva::whereDate('data', $data)
            ->where('periodo_id', $periodoId)
            ->whereNull('cancelada_at')
            ->pluck('secretaria_id');

        return Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->where('setor_id', $setorId)
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();
    }
}
