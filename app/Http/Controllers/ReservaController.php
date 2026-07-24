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

        $periodosConflito = $this->periodosEmConflito(
            (int) $dadosValidados['periodo_id']
        );

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

        $reservaUtilizador = Reserva::where('user_id', Auth::id())
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

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')
            ->firstOrFail();

        try {
            DB::transaction(function () use (
                $dadosValidados,
                $estadoPendente,
                $pagamentoService
            ) {
                $reserva = Reserva::create([
                    'user_id' => Auth::id(),
                    'secretaria_id' => $dadosValidados['secretaria_id'],
                    'periodo_id' => $dadosValidados['periodo_id'],
                    'estado_reserva_id' => $estadoPendente->id,
                    'data' => $dadosValidados['data'],
                    'observacoes' => $dadosValidados['observacoes'] ?? null,
                ]);

                $pagamentoService->criarParaReserva($reserva);
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                'Reserva criada. O pagamento encontra-se pendente.'
            );
    }

    /**
     * Guardar uma reserva de dia inteiro (todos os períodos ativos numa data).
     *
     * Se o próprio utilizador já tiver reservado esta secretária para
     * algum período nesta data (ex: já reservou a Manhã), completa apenas
     * os períodos em falta em vez de falhar — só bloqueia por completo se
     * o conflito for de outra pessoa, ou se o utilizador já tiver outra
     * reserva ativa nesta data para uma secretária diferente.
     */
    public function storeDiaInteiro(
        Request $request,
        PagamentoService $pagamentoService
    ) {
        $request->validate([
            'data' => ['required', 'date'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
        ]);

        $periodos = Periodo::where('ativo', true)
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();

        $reservasDaSecretaria = Reserva::where(
            'secretaria_id',
            $request->secretaria_id
        )
            ->whereDate('data', $request->data)
            ->whereIn('periodo_id', $periodos->pluck('id'))
            ->whereNull('cancelada_at')
            ->get();

        if (
            $reservasDaSecretaria->contains(
                fn ($reserva) => $reserva->user_id !== Auth::id()
            )
        ) {
            return back()
                ->withErrors([
                    'secretaria_id' =>
                        'Esta secretária já se encontra reservada por outra pessoa para pelo menos um período desta data.',
                ])
                ->withInput();
        }

        $reservaNoutraSecretaria = Reserva::where('user_id', Auth::id())
            ->where('secretaria_id', '!=', $request->secretaria_id)
            ->whereDate('data', $request->data)
            ->whereIn('periodo_id', $periodos->pluck('id'))
            ->whereNull('cancelada_at')
            ->exists();

        if ($reservaNoutraSecretaria) {
            return back()
                ->withErrors([
                    'data' =>
                        'Já possui uma reserva para esta data noutro espaço.',
                ])
                ->withInput();
        }

        $periodosJaReservados = $reservasDaSecretaria->pluck('periodo_id');
        $periodosEmFalta = $periodos->reject(
            fn ($periodo) => $periodosJaReservados->contains($periodo->id)
        );

        if ($periodosEmFalta->isEmpty()) {
            return back()
                ->withErrors([
                    'secretaria_id' =>
                        'Já tem esta secretária reservada para o dia inteiro nesta data.',
                ])
                ->withInput();
        }

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')
            ->firstOrFail();

        try {
            DB::transaction(function () use (
                $request,
                $periodosEmFalta,
                $estadoPendente,
                $pagamentoService
            ) {
                foreach ($periodosEmFalta as $periodo) {
                    $reserva = Reserva::create([
                        'user_id' => Auth::id(),
                        'secretaria_id' => $request->secretaria_id,
                        'periodo_id' => $periodo->id,
                        'estado_reserva_id' => $estadoPendente->id,
                        'data' => $request->data,
                    ]);

                    $pagamentoService->criarParaReserva($reserva);
                }
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                'Reserva de dia inteiro criada. Os pagamentos encontram-se pendentes.'
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
                ->with('error', 'Esta reserva já se encontra cancelada.');
        }

        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')
            ->firstOrFail();

        DB::transaction(function () use (
            $reserva,
            $estadoCancelada,
            $pagamentoService
        ) {
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
                ->with('error', 'Não é possível alterar uma reserva cancelada.');
        }

        $periodos = Periodo::where('ativo', true)
            ->where('nome', '!=', 'Dia inteiro')
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

        $reserva->load('secretaria.setor.piso');
        $reservaData = $reserva->toArray();
        $reservaData['data'] = $reserva->data->format('Y-m-d');

        // Outra reserva ativa da mesma secretária/data/utilizador (ex: quando
        // esta reserva faz parte de um "dia inteiro"), para avisar na página.
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

        $reservaUtilizador = Reserva::where('user_id', Auth::id())
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

        try {
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

                if ($alterouDadosComPreco) {
                    $pagamentoService->atualizarValorParaReserva(
                        $reservaBloqueada
                    );
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
     *
     * Usado pelos cartões da página "Nova Reserva", onde cada lugar mostra
     * diretamente os períodos (Manhã/Tarde) que ainda estão livres.
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

    /**
     * Traduz uma violação do índice único de reservas ativas (corrida entre
     * pedidos em simultâneo) numa resposta amigável. Qualquer outro erro de
     * base de dados é relançado, para não mascarar problemas reais.
     */
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

    /**
     * Lugares reserváveis e ativos sem reserva ativa numa data/período.
     *
     * Quando $setorId é omitido, devolve a disponibilidade em todas as
     * categorias (usado pela consulta geral); quando indicado, restringe
     * à categoria selecionada (usado pelo fluxo Piso -> Categoria -> Lugar).
     */
    private function secretariasDisponiveis(
        string $data,
        int|string $periodoId,
        int|string|null $setorId = null
    ) {
        $periodosConflito = $this->periodosEmConflito((int) $periodoId);

        $secretariasReservadas = Reserva::whereDate('data', $data)
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
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

    /**
     * Lugares reserváveis e ativos de um setor, cada um com um mapa
     * periodo_id => disponível (bool) para a data indicada.
     */
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
            ->when(
                $preferencias['monitor'] ?? false,
                fn ($query) => $query->where('monitor', true)
            )
            ->when(
                $preferencias['dock_usb'] ?? false,
                fn ($query) => $query->where('dock_usb', true)
            )
            ->when(
                $preferencias['junto_janela'] ?? false,
                fn ($query) => $query->where('junto_janela', true)
            )
            ->when(
                $preferencias['ergonomica'] ?? false,
                fn ($query) => $query->where('ergonomica', true)
            )
            ->orderBy('codigo')
            ->get();

        $periodosReservadosPorSecretaria = Reserva::whereDate('data', $data)
            ->whereIn('secretaria_id', $secretarias->pluck('id'))
            ->whereNull('cancelada_at')
            ->when(
                $excluirReservaId !== null,
                fn ($query) => $query->where('id', '!=', $excluirReservaId)
            )
            ->get()
            ->groupBy('secretaria_id')
            ->map(fn ($reservas) => $reservas->pluck('periodo_id'));

        return $secretarias->map(function ($secretaria) use (
            $periodos,
            $periodosReservadosPorSecretaria
        ) {
            $reservados = $periodosReservadosPorSecretaria->get(
                $secretaria->id,
                collect()
            );

            $secretaria->periodos_disponiveis = $periodos->mapWithKeys(
                function ($periodo) use ($reservados) {
                    $periodosConflito = $this->periodosEmConflito(
                        (int) $periodo->id
                    );

                    $disponivel = collect($periodosConflito)
                        ->intersect($reservados)
                        ->isEmpty();

                    return [$periodo->id => $disponivel];
                }
            );

            return $secretaria;
        })->values();
    }

    /**
     * Devolve os IDs dos períodos incompatíveis com o período escolhido.
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