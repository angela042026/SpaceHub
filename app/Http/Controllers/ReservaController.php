<?php

namespace App\Http\Controllers;

use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Services\PagamentoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

        // Filtrar por piso
        if ($request->filled('piso')) {
            $query->whereHas(
                'secretaria.setor.piso',
                function ($q) use ($request) {
                    $q->where('id', $request->piso);
                }
            );
        }

        // Filtrar por edifício
        if ($request->filled('edificio')) {
            $query->whereHas(
                'secretaria.setor.piso.edificio',
                function ($q) use ($request) {
                    $q->where('id', $request->edificio);
                }
            );
        }

        $reservas = $query
            ->orderBy('data', 'desc')
            ->get();

        $setores = Setor::where('reservavel', true)
            ->orderBy('nome')
            ->get();

        $pisos = Piso::where('ativo', true)
            ->orderBy('numero')
            ->get();

        $edificios = Edificio::where('ativo', true)
            ->orderBy('nome')
            ->get();

        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas,
            'setores' => $setores,
            'pisos' => $pisos,
            'edificios' => $edificios,
            'filters' => $request->only([
                'estado',
                'data',
                'setor',
                'piso',
                'edificio',
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
    public function store(
        Request $request,
        PagamentoService $pagamentoService
    ) {
        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        /*
         * Obtém os períodos incompatíveis com o período escolhido.
         *
         * Manhã       -> Manhã e Dia inteiro
         * Tarde       -> Tarde e Dia inteiro
         * Dia inteiro -> Manhã, Tarde e Dia inteiro
         */
        $periodosConflito = $this->periodosEmConflito(
            (int) $dadosValidados['periodo_id']
        );

        // Verifica se a secretária já está ocupada.
        $reservaExistente = Reserva::where(
            'secretaria_id',
            $dadosValidados['secretaria_id']
        )
            ->whereDate('data', $dadosValidados['data'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors([
                    'secretaria_id' =>
                        'Esta secretária já se encontra reservada para a data e período selecionados.',
                ])
                ->withInput();
        }

        // Verifica se o utilizador já possui uma reserva incompatível.
        $reservaUtilizador = Reserva::where(
            'user_id',
            Auth::id()
        )
            ->whereDate('data', $dadosValidados['data'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors([
                    'data' =>
                        'Já possui uma reserva incompatível com este período na data selecionada.',
                ])
                ->withInput();
        }

        // Obtém o estado "Pendente".
        $estadoPendente = EstadoReserva::where(
            'codigo',
            'pendente'
        )->firstOrFail();

        DB::transaction(function () use (
            $dadosValidados,
            $estadoPendente,
            $pagamentoService
        ) {
            $reserva = Reserva::create([
                'user_id' => Auth::id(),
                'secretaria_id' =>
                    $dadosValidados['secretaria_id'],
                'periodo_id' =>
                    $dadosValidados['periodo_id'],
                'estado_reserva_id' =>
                    $estadoPendente->id,
                'data' => $dadosValidados['data'],
                'observacoes' =>
                    $dadosValidados['observacoes'] ?? null,
            ]);

            $pagamentoService->criarParaReserva($reserva);
        });

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                'Reserva criada. O pagamento encontra-se pendente.'
            );
    }

    /**
     * Cancelar uma reserva.
     */
    public function cancelar(
        Reserva $reserva,
        PagamentoService $pagamentoService
    ) {
        if ($reserva->user_id !== Auth::id()) {
            abort(403, 'Esta reserva não te pertence.');
        }

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with(
                    'error',
                    'Esta reserva já se encontra cancelada.'
                );
        }

        $estadoCancelada = EstadoReserva::where(
            'codigo',
            'cancelada'
        )->firstOrFail();

        DB::transaction(function () use (
            $reserva,
            $estadoCancelada,
            $pagamentoService
        ) {
            /*
             * Volta a obter a reserva com bloqueio durante
             * a transação, evitando alterações simultâneas.
             */
            $reservaBloqueada = Reserva::whereKey($reserva->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * A verificação é repetida dentro da transação,
             * porque a reserva pode ter sido cancelada entretanto.
             */
            if ($reservaBloqueada->cancelada_at !== null) {
                return;
            }

            /*
             * Primeiro verifica e cancela o pagamento.
             *
             * Se estiver pago, o serviço lança uma exceção
             * e toda a transação é anulada.
             */
            $pagamentoService->cancelarParaReserva(
                $reservaBloqueada
            );

            $reservaBloqueada->update([
                'estado_reserva_id' => $estadoCancelada->id,
                'cancelada_at' => now(),
            ]);
        });

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                'Reserva e pagamento cancelados com sucesso.'
            );
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
                ->with(
                    'error',
                    'Não é possível alterar uma reserva cancelada.'
                );
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
public function update(
    Request $request,
    Reserva $reserva,
    PagamentoService $pagamentoService
) {
    if ($reserva->user_id !== Auth::id()) {
        abort(403, 'Esta reserva não te pertence.');
    }

    if ($reserva->cancelada_at !== null) {
        return redirect()
            ->route('reservas.index')
            ->with(
                'error',
                'Não é possível alterar uma reserva cancelada.'
            );
    }

    $dadosValidados = $request->validate([
        'data' => ['required', 'date'],
        'periodo_id' => ['required', 'exists:periodos,id'],
        'secretaria_id' => ['required', 'exists:secretarias,id'],
        'observacoes' => ['nullable', 'string', 'max:500'],
    ]);

    $periodosConflito = $this->periodosEmConflito(
        (int) $dadosValidados['periodo_id']
    );

    // Verifica se outra reserva ocupa a secretária.
    $reservaExistente = Reserva::where(
        'secretaria_id',
        $dadosValidados['secretaria_id']
    )
        ->whereDate('data', $dadosValidados['data'])
        ->whereIn('periodo_id', $periodosConflito)
        ->whereNull('cancelada_at')
        ->where('id', '!=', $reserva->id)
        ->exists();

    if ($reservaExistente) {
        return back()
            ->withErrors([
                'secretaria_id' =>
                    'Esta secretária já se encontra reservada para a data e período selecionados.',
            ])
            ->withInput();
    }

    // Verifica se o utilizador já tem outra reserva incompatível.
    $reservaUtilizador = Reserva::where(
        'user_id',
        Auth::id()
    )
        ->whereDate('data', $dadosValidados['data'])
        ->whereIn('periodo_id', $periodosConflito)
        ->whereNull('cancelada_at')
        ->where('id', '!=', $reserva->id)
        ->exists();

    if ($reservaUtilizador) {
        return back()
            ->withErrors([
                'data' =>
                    'Já possui outra reserva incompatível com este período na data selecionada.',
            ])
            ->withInput();
    }

    $alterouDadosComPreco =
        (int) $reserva->periodo_id !==
            (int) $dadosValidados['periodo_id']
        ||
        (int) $reserva->secretaria_id !==
            (int) $dadosValidados['secretaria_id'];

    DB::transaction(function () use (
        $reserva,
        $dadosValidados,
        $alterouDadosComPreco,
        $pagamentoService
    ) {
        $reservaBloqueada = Reserva::whereKey($reserva->id)
            ->lockForUpdate()
            ->firstOrFail();

        $reservaBloqueada->update([
            'data' => $dadosValidados['data'],
            'periodo_id' => $dadosValidados['periodo_id'],
            'secretaria_id' => $dadosValidados['secretaria_id'],
            'observacoes' =>
                $dadosValidados['observacoes'] ?? null,
        ]);

        /*
         * O preço só precisa de ser recalculado quando muda
         * a secretária ou o período.
         */
        if ($alterouDadosComPreco) {
            $pagamentoService->atualizarValorParaReserva(
                $reservaBloqueada
            );
        }
    });

    return redirect()
        ->route('reservas.index')
        ->with('success', 'Reserva atualizada com sucesso.');
}

    /**
     * Histórico de reservas passadas do utilizador autenticado.
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
     * Usado tanto pela consulta em direto do formulário de criação
     * como pela página dedicada de disponibilidade.
     */
    public function availability(Request $request)
    {
        if ($request->wantsJson()) {
            $request->validate([
                'data' => ['required', 'date'],
                'periodo_id' => ['required', 'exists:periodos,id'],
                'setor_id' => ['nullable', 'exists:setores,id'],
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

        $pisos = Piso::where('ativo', true)
            ->orderBy('numero')
            ->get();

        $setores = Setor::where('reservavel', true)
            ->with('piso')
            ->orderBy('piso_id')
            ->orderBy('nome')
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
            'pisos' => $pisos,
            'setores' => $setores,
            'secretariasDisponiveis' => $secretariasDisponiveis,
            'filters' => $request->only([
                'data',
                'periodo_id',
                'setor_id',
            ]),
        ]);
    }

    /**
     * Lugares reserváveis e ativos sem reserva incompatível
     * numa determinada data e período.
     *
     * Quando $setorId é omitido, devolve a disponibilidade
     * em todos os setores.
     */
    private function secretariasDisponiveis(
        string $data,
        int|string $periodoId,
        int|string|null $setorId = null
    ) {
        $periodosConflito = $this->periodosEmConflito(
            (int) $periodoId
        );

        $secretariasReservadas = Reserva::whereDate('data', $data)
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->pluck('secretaria_id');

        return Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->when(
                $setorId !== null,
                function ($query) use ($setorId) {
                    $query->where('setor_id', $setorId);
                }
            )
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();
    }

    /**
     * Devolve os IDs dos períodos incompatíveis
     * com o período escolhido.
     */
    private function periodosEmConflito(int $periodoId): array
    {
        $periodoSelecionado = Periodo::findOrFail($periodoId);

        $nomesPeriodos = match ($periodoSelecionado->nome) {
            'Manhã' => [
                'Manhã',
                'Dia inteiro',
            ],

            'Tarde' => [
                'Tarde',
                'Dia inteiro',
            ],

            'Dia inteiro' => [
                'Manhã',
                'Tarde',
                'Dia inteiro',
            ],

            default => [
                $periodoSelecionado->nome,
            ],
        };

        return Periodo::whereIn('nome', $nomesPeriodos)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}