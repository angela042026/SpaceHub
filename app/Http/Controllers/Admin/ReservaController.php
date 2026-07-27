<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReservaRequest;
use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Notifications\ReservaCanceladaNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    /**
     * Lista todas as reservas da plataforma, com pesquisa e filtros.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Reserva::class);

        $query = Reserva::query()->with([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ]);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->whereHas('user', function ($query) use ($search): void {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('estado')) {
            $query->whereHas('estadoReserva', function ($query) use ($request): void {
                $query->where('codigo', $request->input('estado'));
            });
        }

        if ($request->filled('data')) {
            $query->whereDate('data', $request->input('data'));
        }

        if ($request->filled('edificio')) {
            $query->whereHas('secretaria.setor.piso.edificio', function ($query) use ($request): void {
                $query->where('id', $request->integer('edificio'));
            });
        }

        if ($request->filled('piso')) {
            $query->whereHas('secretaria.setor.piso', function ($query) use ($request): void {
                $query->where('id', $request->integer('piso'));
            });
        }

        if ($request->filled('setor')) {
            $query->whereHas('secretaria.setor', function ($query) use ($request): void {
                $query->where('id', $request->integer('setor'));
            });
        }

        $reservas = $query
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Reservas/Index', [
            'reservas' => $reservas,
            'estados' => EstadoReserva::orderBy('nome')->get(['id', 'nome', 'codigo']),
            'edificios' => Edificio::where('ativo', true)->orderBy('nome')->get(),
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get(),
            'setores' => Setor::where('reservavel', true)->orderBy('nome')->get(),
            'filters' => $request->only([
                'search',
                'estado',
                'data',
                'edificio',
                'piso',
                'setor',
            ]),
        ]);
    }

    /**
     * Mostra o formulário de edição de uma reserva (qualquer utilizador).
     */
    public function edit(Reserva $reserva): Response
    {
        Gate::authorize('update', $reserva);

        $reserva->load(['user', 'secretaria.setor.piso.edificio', 'periodo', 'estadoReserva']);

        return Inertia::render('Admin/Reservas/Edit', [
            'reserva' => $reserva,
            'periodos' => Periodo::where('ativo', true)->orderBy('hora_inicio')->get(),
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get(),
            'setores' => Setor::where('reservavel', true)->with('piso')->orderBy('piso_id')->orderBy('nome')->get(),
            'secretarias' => Secretaria::where('reservavel', true)
                ->where('ativo', true)
                ->with('setor.piso')
                ->orderBy('codigo')
                ->get(),
        ]);
    }

    /**
     * Atualiza uma reserva (qualquer utilizador), mantendo as mesmas
     * validações de conflito usadas no fluxo normal do utilizador.
     */
    public function update(UpdateReservaRequest $request, Reserva $reserva): RedirectResponse
    {
        Gate::authorize('update', $reserva);

        $dados = $request->validated();

        $data = $dados['data'] ?? $reserva->data->format('Y-m-d');
        $periodoId = $dados['periodo_id'] ?? $reserva->periodo_id;
        $secretariaId = $dados['secretaria_id'] ?? $reserva->secretaria_id;

        $reservaExistente = Reserva::where('secretaria_id', $secretariaId)
            ->whereDate('data', $data)
            ->where('periodo_id', $periodoId)
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

        $reservaUtilizador = Reserva::where('user_id', $reserva->user_id)
            ->whereDate('data', $data)
            ->where('periodo_id', $periodoId)
            ->whereNull('cancelada_at')
            ->where('id', '!=', $reserva->id)
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors([
                    'data' => 'Este utilizador já possui outra reserva para esta data e período.',
                ])
                ->withInput();
        }

        $reserva->update($dados);

        return redirect()
            ->route('admin.reservas.index')
            ->with('success', 'Reserva atualizada com sucesso.');
    }

    /**
     * Cancela uma reserva de qualquer utilizador.
     */
    public function cancelar(Reserva $reserva): RedirectResponse
    {
        Gate::authorize('cancelar', $reserva);

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('admin.reservas.index')
                ->with('error', 'Esta reserva já se encontra cancelada.');
        }

        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->firstOrFail();

        $reserva->update([
            'estado_reserva_id' => $estadoCancelada->id,
            'cancelada_at' => now(),
        ]);

        $reserva->user->notify(new ReservaCanceladaNotification($reserva));

        return redirect()
            ->route('admin.reservas.index')
            ->with('success', 'Reserva cancelada com sucesso.');
    }
}
