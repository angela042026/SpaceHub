<?php

namespace App\Http\Controllers;

use App\Models\Avaliacao;
use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Setor;
use App\Notifications\ReservaCanceladaNotification;
use App\Services\PagamentoService;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

/**
 * Reservas do utilizador autenticado: listagem, criação, edição e
 * cancelamento.
 *
 * A consulta de disponibilidade vive no ReservaDisponibilidadeController
 * e o histórico no ReservaHistoricoController. As regras de criação estão
 * no ReservaCriacaoService.
 */
class ReservaController extends Controller
{
    public function __construct(
        private ReservaDisponibilidadeService $disponibilidade
    ) {
    }

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
                'avaliacao',
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

        return Inertia::render('Reservas/Index', [
            /*
             * 9 por página: os cartões são apresentados numa grelha de
             * três colunas, por isso enche três linhas certas.
             * O withQueryString mantém os filtros ao mudar de página.
             */
            'reservas' => $query->orderBy('data', 'desc')
                ->paginate(9)
                ->withQueryString(),

            'setores' => Setor::where('reservavel', true)
                ->orderBy('nome')
                ->get(),

            'pisos' => Piso::where('ativo', true)
                ->orderBy('numero')
                ->get(),

            'edificios' => Edificio::where('ativo', true)
                ->orderBy('nome')
                ->get(),

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
        return Inertia::render('Reservas/Create', [
            'periodos' => $this->disponibilidade->periodosReservaAtivos(),
            'pisos' => $this->disponibilidade->pisosAtivosParaReserva(),
            'setores' => $this->disponibilidade->setoresReservaveis(),

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
     * Guardar uma nova reserva de meio dia (Manhã ou Tarde).
     */
    public function store(
        Request $request,
        ReservaCriacaoService $criacao
    ) {
        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'tipo_duracao' => ['required', 'in:diaria'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        $criacao->criarMeioDia($dadosValidados, (int) Auth::id());

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                'Reserva criada. O pagamento encontra-se pendente.'
            );
    }

    /**
     * Guardar uma reserva de dia inteiro (diária, semanal, mensal ou anual).
     */
    public function storeDiaInteiro(
        Request $request,
        ReservaCriacaoService $criacao
    ) {
        $dadosValidados = $request->validate([
            'data' => ['required', 'date'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'tipo_duracao' => ['required', 'in:diaria,semanal,mensal,anual'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        $criacao->criarDiaInteiro($dadosValidados, (int) Auth::id());

        $descricaoDuracao = $criacao->descricaoDuracao(
            $dadosValidados['tipo_duracao']
        );

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                "Reserva de {$descricaoDuracao} criada. O pagamento encontra-se pendente."
            );
    }

    /**
     * Cancelar uma reserva.
     */
    public function cancelar(
        Reserva $reserva,
        PagamentoService $pagamentoService
    ) {
        Gate::authorize('gerirPropria', $reserva);

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', 'Esta reserva já se encontra cancelada.');
        }

        $estadoCanceladaId = EstadoReserva::idPorCodigo('cancelada');

        abort_if($estadoCanceladaId === null, 404);

        DB::transaction(function () use (
            $reserva,
            $estadoCanceladaId,
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
                'estado_reserva_id' => $estadoCanceladaId,
                'cancelada_at' => now(),
            ]);

            $reservaBloqueada->user?->notify(
                new ReservaCanceladaNotification($reservaBloqueada)
            );
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
        Gate::authorize('gerirPropria', $reserva);

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', 'Não é possível alterar uma reserva cancelada.');
        }

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
            'periodos' => $this->disponibilidade->periodosReservaAtivos(),
            'pisos' => $this->disponibilidade->pisosAtivosParaReserva(),
            'setores' => $this->disponibilidade->setoresReservaveis(),
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
        Gate::authorize('gerirPropria', $reserva);

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

        $periodosConflito = $this->disponibilidade->periodosEmConflito(
            (int) $dadosValidados['periodo_id']
        );

        if ($this->disponibilidade->existeReservaAtivaNaData(
            'secretaria_id',
            (int) $dadosValidados['secretaria_id'],
            $periodosConflito,
            $dadosValidados['data'],
            $reserva->id
        )) {
            return back()
                ->withErrors([
                    'secretaria_id' =>
                    'Esta secretária já se encontra reservada para a data e período selecionados.',
                ])
                ->withInput();
        }

        if ($this->disponibilidade->existeReservaAtivaNaData(
            'user_id',
            (int) Auth::id(),
            $periodosConflito,
            $dadosValidados['data'],
            $reserva->id
        )) {
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
     * Traduz uma violação do índice único de reservas ativas (corrida entre
     * pedidos em simultâneo) numa resposta amigável. Qualquer outro erro de
     * base de dados é relançado, para não mascarar problemas reais.
     */
    private function respostaConflitoReserva(QueryException $e)
    {
        if (! $this->disponibilidade->ehConflitoDeReservaAtiva($e)) {
            throw $e;
        }

        return back()
            ->withErrors([
                'secretaria_id' => 'Este lugar acabou de ser reservado por outra pessoa. Escolhe outro período ou lugar.',
            ])
            ->withInput();
    }
}
