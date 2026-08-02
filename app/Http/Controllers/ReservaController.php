<?php

namespace App\Http\Controllers;

use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Notifications\PaymentRequiredNotification;
use App\Notifications\ReservaCanceladaNotification;
use App\Notifications\ReservaCriadaNotification;
use App\Services\PagamentoService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
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
                'pagamento',
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
            $query->whereHas('secretaria.setor.piso', function ($q) use ($request) {
                $q->where('id', $request->piso);
            });
        }

        // Filtrar por edifício
        if ($request->filled('edificio')) {
            $query->whereHas('secretaria.setor.piso.edificio', function ($q) use ($request) {
                $q->where('id', $request->edificio);
            });
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
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();

        // Pisos ativos (exclui a garagem)
        $pisos = Piso::where('ativo', true)
            ->where('numero', '>=', 0)
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
                'secretaria_id',
            ]),
        ]);
    }

    /**
     * Guardar uma nova reserva de meio dia.
     */
    public function store(
        Request $request,
        PagamentoService $pagamentoService
    ) {
        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'tipo_duracao' => ['required', 'in:diaria'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        $periodo = Periodo::findOrFail($dadosValidados['periodo_id']);

        if ($periodo->nome === 'Dia inteiro') {
            return back()
                ->withErrors([
                    'periodo_id' => 'As reservas de dia inteiro devem ser efetuadas através da opção Dia inteiro.',
                ])
                ->withInput();
        }

        $dataInicio = Carbon::parse($dadosValidados['data'])->toDateString();
        $dataFim = $this->calcularDataFim($dataInicio, 'diaria');
        $periodosConflito = $this->periodosEmConflito((int) $dadosValidados['periodo_id']);

        // Verificar ocupação da secretária
        $reservaExistente = Reserva::where('secretaria_id', $dadosValidados['secretaria_id'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $dataFim)
            ->where(function ($query) use ($dataInicio) {
                $query->whereDate('data_fim', '>=', $dataInicio)
                    ->orWhere(function ($queryAntiga) use ($dataInicio) {
                        $queryAntiga->whereNull('data_fim')
                            ->whereDate('data', '>=', $dataInicio);
                    });
            })
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors([
                    'secretaria_id' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
                ])
                ->withInput();
        }

        // Verificar reservas do próprio utilizador
        $reservaUtilizador = Reserva::where('user_id', Auth::id())
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $dataFim)
            ->where(function ($query) use ($dataInicio) {
                $query->whereDate('data_fim', '>=', $dataInicio)
                    ->orWhere(function ($queryAntiga) use ($dataInicio) {
                        $queryAntiga->whereNull('data_fim')
                            ->whereDate('data', '>=', $dataInicio);
                    });
            })
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors([
                    'data' => 'Já possui uma reserva incompatível com este período na data selecionada.',
                ])
                ->withInput();
        }

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->firstOrFail();

        try {
            DB::transaction(function () use ($dadosValidados, $estadoPendente, $pagamentoService, $request, $dataInicio, $dataFim) {
                $reserva = Reserva::create([
                    'user_id' => Auth::id(),
                    'secretaria_id' => $dadosValidados['secretaria_id'],
                    'periodo_id' => $dadosValidados['periodo_id'],
                    'estado_reserva_id' => $estadoPendente->id,
                    'data' => $dataInicio,
                    'data_fim' => $dataFim,
                    'tipo_duracao' => 'diaria',
                    'observacoes' => $dadosValidados['observacoes'] ?? null,
                ]);

                $pagamento = $pagamentoService->criarParaReserva($reserva);

                if ($pagamento) {
                    $request->user()->notify(new PaymentRequiredNotification($reserva));
                }

                Auth::user()->notify(
                    new ReservaCriadaNotification($reserva->load('secretaria'))
                );
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva criada. O pagamento encontra-se pendente.');
    }

    /**
     * Guardar uma reserva de dia inteiro ou longa duração.
     */
    public function storeDiaInteiro(
        Request $request,
        PagamentoService $pagamentoService
    ) {
        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'tipo_duracao' => ['required', 'in:diaria,semanal,mensal,anual'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        $tipoDuracao = $dadosValidados['tipo_duracao'];
        $dataInicialCarbon = Carbon::parse($dadosValidados['data']);

        if ($tipoDuracao !== 'diaria' && $dataInicialCarbon->isWeekend()) {
            return back()
                ->withErrors([
                    'data' => 'As reservas semanais, mensais e anuais devem começar num dia útil.',
                ])
                ->withInput();
        }

        $dataInicio = $dataInicialCarbon->toDateString();
        $dataFim = $this->calcularDataFim($dataInicio, $tipoDuracao);

        $periodoDiaInteiro = Periodo::where('nome', 'Dia inteiro')->first();

        if ($periodoDiaInteiro === null) {
            return back()
                ->withErrors(['tipo_duracao' => 'O período Dia inteiro não está configurado no sistema.'])
                ->withInput();
        }

        if (!$periodoDiaInteiro->ativo) {
            return back()
                ->withErrors(['tipo_duracao' => 'O período Dia inteiro encontra-se inativo.'])
                ->withInput();
        }

        $periodosConflito = $this->periodosEmConflito((int) $periodoDiaInteiro->id);

        $reservaExistente = Reserva::where('secretaria_id', $dadosValidados['secretaria_id'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $dataFim)
            ->where(function ($query) use ($dataInicio) {
                $query->whereDate('data_fim', '>=', $dataInicio)
                    ->orWhere(function ($queryAntiga) use ($dataInicio) {
                        $queryAntiga->whereNull('data_fim')
                            ->whereDate('data', '>=', $dataInicio);
                    });
            })
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors(['secretaria_id' => 'Esta secretária já possui uma reserva em pelo menos um dos dias selecionados.'])
                ->withInput();
        }

        $reservaUtilizador = Reserva::where('user_id', Auth::id())
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $dataFim)
            ->where(function ($query) use ($dataInicio) {
                $query->whereDate('data_fim', '>=', $dataInicio)
                    ->orWhere(function ($queryAntiga) use ($dataInicio) {
                        $queryAntiga->whereNull('data_fim')
                            ->whereDate('data', '>=', $dataInicio);
                    });
            })
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors(['data' => 'Já possui outra reserva incompatível em pelo menos um dos dias selecionados.'])
                ->withInput();
        }

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->first();

        if ($estadoPendente === null) {
            return back()
                ->withErrors(['reserva' => 'O estado pendente não está configurado no sistema.'])
                ->withInput();
        }

        try {
            DB::transaction(function () use (
                $dadosValidados,
                $tipoDuracao,
                $dataInicio,
                $dataFim,
                $periodoDiaInteiro,
                $estadoPendente,
                $pagamentoService,
                $request
            ) {
                $reserva = Reserva::create([
                    'user_id' => Auth::id(),
                    'secretaria_id' => $dadosValidados['secretaria_id'],
                    'periodo_id' => $periodoDiaInteiro->id,
                    'estado_reserva_id' => $estadoPendente->id,
                    'data' => $dataInicio,
                    'data_fim' => $dataFim,
                    'tipo_duracao' => $tipoDuracao,
                    'observacoes' => $dadosValidados['observacoes'] ?? null,
                ]);

                $pagamento = $pagamentoService->criarParaReserva($reserva);

                if (config('services.pagamento.notificacoes_ativas', false) && $pagamento) {
                    $request->user()->notify(new PaymentRequiredNotification($reserva));
                }

                Auth::user()->notify(
                    new ReservaCriadaNotification($reserva->load('secretaria'))
                );
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

        $descricaoDuracao = match ($tipoDuracao) {
            'diaria' => 'dia inteiro',
            'semanal' => '5 dias úteis',
            'mensal' => '22 dias úteis',
            'anual' => '264 dias úteis',
        };

        return redirect()
            ->route('reservas.index')
            ->with('success', "Reserva de {$descricaoDuracao} criada. O pagamento encontra-se pendente.");
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
                ->with('error', 'Esta reserva já se encontra cancelada.');
        }

        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->firstOrFail();

        DB::transaction(function () use ($reserva, $estadoCancelada, $pagamentoService) {
            $reservaBloqueada = Reserva::whereKey($reserva->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($reservaBloqueada->cancelada_at !== null) {
                return;
            }

            $pagamentoService->cancelarParaReserva($reservaBloqueada);

            $reservaBloqueada->update([
                'estado_reserva_id' => $estadoCancelada->id,
                'cancelada_at' => now(),
            ]);

            $reservaBloqueada->user->notify(
                new ReservaCanceladaNotification($reservaBloqueada)
            );
        });

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva e pagamento cancelados com sucesso.');
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
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();

        $pisos = Piso::where('ativo', true)
            ->where('numero', '>=', 0)
            ->orderBy('numero')
            ->get();

        $setores = Setor::where('reservavel', true)
            ->with('piso')
            ->orderBy('piso_id')
            ->orderBy('nome')
            ->get();

        $reserva->load('secretaria.setor.piso');
        $reservaData = $reserva->toArray();
        $reservaData['data'] = $reserva->data->format('Y-m-d');

        $parDiaInteiro = Reserva::where('user_id', $reserva->user_id)
            ->where('secretaria_id', $reserva->secretaria_id)
            ->whereDate('data', $reserva->data)
            ->where('id', '!=', $reserva->id)
            ->whereNull('cancelada_at')
            ->with('periodo')
            ->first();

        return Inertia::render('Reservas/Edit', [
            'reserva' => $reservaData,
            'periodos' => $periodos,
            'pisos' => $pisos,
            'setores' => $setores,
            'parDiaInteiro' => $parDiaInteiro?->periodo?->nome,
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
                ->with('error', 'Não é possível alterar uma reserva cancelada.');
        }

        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        $periodosConflito = $this->periodosEmConflito((int) $dadosValidados['periodo_id']);

        $reservaExistente = Reserva::where('secretaria_id', $dadosValidados['secretaria_id'])
            ->whereDate('data', $dadosValidados['data'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->where('id', '!=', $reserva->id)
            ->exists();

        if ($reservaExistente) {
            return back()
                ->withErrors(['secretaria_id' => 'Esta secretária já se encontra reservada para a data e período selecionados.'])
                ->withInput();
        }

        $reservaUtilizador = Reserva::where('user_id', Auth::id())
            ->whereDate('data', $dadosValidados['data'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->where('id', '!=', $reserva->id)
            ->exists();

        if ($reservaUtilizador) {
            return back()
                ->withErrors(['data' => 'Já possui outra reserva incompatível com este período na data selecionada.'])
                ->withInput();
        }

        $alterouDadosComPreco =
            (int) $reserva->periodo_id !== (int) $dadosValidados['periodo_id'] ||
            (int) $reserva->secretaria_id !== (int) $dadosValidados['secretaria_id'];

        try {
            DB::transaction(function () use ($reserva, $dadosValidados, $alterouDadosComPreco, $pagamentoService) {
                $reservaBloqueada = Reserva::whereKey($reserva->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $reservaBloqueada->update([
                    'data' => $dadosValidados['data'],
                    'periodo_id' => $dadosValidados['periodo_id'],
                    'secretaria_id' => $dadosValidados['secretaria_id'],
                    'observacoes' => $dadosValidados['observacoes'] ?? null,
                ]);

                if ($alterouDadosComPreco) {
                    $pagamentoService->atualizarValorParaReserva($reservaBloqueada);
                }
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

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
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();

        $pisos = Piso::where('ativo', true)
            ->where('numero', '>=', 0)
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
     * Lugares de um setor com a disponibilidade de cada período numa data.
     */
    public function lugaresPorSetor(Request $request)
    {
        $request->validate([
            'data' => ['required', 'date'],
            'setor_id' => ['required', 'exists:setores,id'],
            'monitor' => ['sometimes', 'boolean'],
            'dock_usb' => ['sometimes', 'boolean'],
            'junto_janela' => ['sometimes', 'boolean'],
            'ergonomica' => ['sometimes', 'boolean'],
            'excluir_reserva_id' => ['sometimes', 'nullable', 'exists:reservas,id'],
        ]);

        $preferencias = [
            'monitor' => $request->boolean('monitor'),
            'dock_usb' => $request->boolean('dock_usb'),
            'junto_janela' => $request->boolean('junto_janela'),
            'ergonomica' => $request->boolean('ergonomica'),
        ];

        return response()->json(
            $this->secretariasComDisponibilidade(
                $request->data,
                $request->setor_id,
                $preferencias,
                $request->integer('excluir_reserva_id') ?: null
            )
        );
    }

    private function respostaConflitoReserva(QueryException $e)
    {
        if (($e->errorInfo[1] ?? null) !== 1062) {
            throw $e;
        }

        return back()
            ->withErrors([
                'secretaria_id' => 'Este lugar acabou de ser reservado por outra pessoa. Escolhe outro período ou lugar.',
            ])
            ->withInput();
    }

    private function secretariasDisponiveis(
        string $data,
        int|string $periodoId,
        int|string|null $setorId = null
    ) {
        $periodosConflito = $this->periodosEmConflito((int) $periodoId);

        $secretariasReservadas = Reserva::whereNull('cancelada_at')
            ->whereIn('periodo_id', $periodosConflito)
            ->whereDate('data', '<=', $data)
            ->where(function ($query) use ($data) {
                $query->whereDate('data_fim', '>=', $data)
                    ->orWhere(function ($qAntiga) use ($data) {
                        $qAntiga->whereNull('data_fim')->whereDate('data', '>=', $data);
                    });
            })
            ->pluck('secretaria_id');

        return Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->when($setorId !== null, function ($query) use ($setorId) {
                $query->where('setor_id', $setorId);
            })
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();
    }

    private function secretariasComDisponibilidade(
        string $data,
        int|string $setorId,
        array $preferencias = [],
        ?int $excluirReservaId = null
    ) {
        $periodos = Periodo::where('ativo', true)
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();

        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->where('setor_id', $setorId)
            ->when($preferencias['monitor'] ?? false, fn($q) => $q->where('monitor', true))
            ->when($preferencias['dock_usb'] ?? false, fn($q) => $q->where('dock_usb', true))
            ->when($preferencias['junto_janela'] ?? false, fn($q) => $q->where('junto_janela', true))
            ->when($preferencias['ergonomica'] ?? false, fn($q) => $q->where('ergonomica', true))
            ->orderBy('codigo')
            ->get();

        $periodosReservadosPorSecretaria = Reserva::whereNull('cancelada_at')
            ->whereIn('secretaria_id', $secretarias->pluck('id'))
            ->whereDate('data', '<=', $data)
            ->where(function ($query) use ($data) {
                $query->whereDate('data_fim', '>=', $data)
                    ->orWhere(function ($qAntiga) use ($data) {
                        $qAntiga->whereNull('data_fim')->whereDate('data', '>=', $data);
                    });
            })
            ->when($excluirReservaId !== null, fn($q) => $q->where('id', '!=', $excluirReservaId))
            ->get()
            ->groupBy('secretaria_id')
            ->map(fn($reservas) => $reservas->pluck('periodo_id'));

        return $secretarias->map(function ($secretaria) use ($periodos, $periodosReservadosPorSecretaria) {
            $reservados = $periodosReservadosPorSecretaria->get($secretaria->id, collect());

            $secretaria->periodos_disponiveis = $periodos->mapWithKeys(function ($periodo) use ($reservados) {
                $periodosConflito = $this->periodosEmConflito((int) $periodo->id);

                $disponivel = collect($periodosConflito)
                    ->intersect($reservados)
                    ->isEmpty();

                return [$periodo->id => $disponivel];
            });

            return $secretaria;
        })->values();
    }

    private function calcularDataFim(
        string $dataInicio,
        string $tipoDuracao
    ): string {
        $quantidadeDiasUteis = match ($tipoDuracao) {
            'diaria' => 1,
            'semanal' => 5,
            'mensal' => 22,
            'anual' => 264,
            default => 1,
        };

        $dataFim = Carbon::parse($dataInicio);

        if ($quantidadeDiasUteis === 1) {
            return $dataFim->toDateString();
        }

        $diasContados = $dataFim->isWeekday() ? 1 : 0;

        while ($diasContados < $quantidadeDiasUteis) {
            $dataFim->addDay();

            if ($dataFim->isWeekday()) {
                $diasContados++;
            }
        }

        return $dataFim->toDateString();
    }

    private function periodosEmConflito(int $periodoId): array
    {
        $periodoSelecionado = Periodo::findOrFail($periodoId);

        $nomesPeriodos = match ($periodoSelecionado->nome) {
            'Manhã' => ['Manhã', 'Dia inteiro'],
            'Tarde' => ['Tarde', 'Dia inteiro'],
            'Dia inteiro' => ['Manhã', 'Tarde', 'Dia inteiro'],
            default => [$periodoSelecionado->nome],
        };

        return Periodo::whereIn('nome', $nomesPeriodos)->pluck('id')->toArray();
    }
}
