<?php

namespace App\Http\Controllers;

use App\Models\Avaliacao;
use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Setor;
use App\Notifications\ReservaCanceladaNotification;
use App\Services\ActivityLogger;
use App\Services\GoogleCalendarService;
use App\Services\PagamentoService;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
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
                'secretaria.setor.piso.edificio',
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
                ->get()
                ->each(fn (Setor $setor) => $setor->nome = $setor->nome_localizado),

            'pisos' => Piso::where('ativo', true)
                ->orderBy('numero')
                ->get()
                ->each(fn (Piso $piso) => $piso->nome = $piso->nome_localizado),

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

            'secretariasFavoritas' => Auth::user()
                ->secretariasFavoritas()
                ->pluck('secretarias.id'),

            'googleCalendarConectado' => Auth::user()->googleCalendarConectado(),
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

        $reserva = $criacao->criarMeioDia($dadosValidados, (int) Auth::id());

        ActivityLogger::log(
            $request->user(),
            'reserva_criada',
            $this->descreverReserva($reserva),
            $reserva
        );

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

        $reserva = $criacao->criarDiaInteiro($dadosValidados, (int) Auth::id());

        ActivityLogger::log(
            $request->user(),
            'reserva_criada',
            $this->descreverReserva($reserva),
            $reserva
        );

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
        PagamentoService $pagamentoService,
        GoogleCalendarService $googleCalendar
    ) {
        Gate::authorize('gerirPropria', $reserva);

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('reservas.index')
                ->with('error', __('Esta reserva já se encontra cancelada.'));
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

            ReservaDia::where('reserva_id', $reservaBloqueada->id)->delete();

            $reservaBloqueada->user?->notify(
                new ReservaCanceladaNotification($reservaBloqueada)
            );
        });

        ActivityLogger::log(
            Auth::user(),
            'reserva_cancelada',
            $this->descreverReserva($reserva->refresh())
        );
        $googleCalendar->removerEvento($reserva->fresh(['user']));

        $googleCalendar->removerEvento($reserva->fresh(['user']));

        return redirect()
            ->route('reservas.index')
            ->with(
                'success',
                __('Reserva e pagamento cancelados com sucesso.')
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
                ->with('error', __('Não é possível alterar uma reserva cancelada.'));
        }

        $reserva->load('secretaria.setor.piso');
        $reserva->secretaria->setor->nome = $reserva->secretaria->setor->nome_localizado;
        $reserva->secretaria->setor->piso->nome = $reserva->secretaria->setor->piso->nome_localizado;
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
            'periodos' => $this->disponibilidade->periodosAtivos(),
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
                    __('Não é possível alterar uma reserva cancelada.')
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

        // RES-03: preserva o número de dias original ao mudar só a data de
        // início — sem isto, data_fim ficava parada no valor antigo e a
        // duração de uma reserva de vários dias mudava silenciosamente (ou
        // ficava invertida, se a nova data de início passasse a antiga
        // data_fim).
        $duracaoDias = $reserva->data->diffInDays(
            $reserva->data_fim ?? $reserva->data
        );
        $novaDataFim = Carbon::parse($dadosValidados['data'])
            ->addDays($duracaoDias)
            ->toDateString();

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'secretaria_id',
            (int) $dadosValidados['secretaria_id'],
            $periodosConflito,
            $dadosValidados['data'],
            $novaDataFim,
            $reserva->id
        )) {
            return back()
                ->withErrors([
                    'secretaria_id' =>
                    __('Esta secretária já se encontra reservada para a data e período selecionados.'),
                ])
                ->withInput();
        }

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'user_id',
            (int) Auth::id(),
            $periodosConflito,
            $dadosValidados['data'],
            $novaDataFim,
            $reserva->id
        )) {
            return back()
                ->withErrors([
                    'data' =>
                    __('Já possui outra reserva incompatível com este período na data selecionada.'),
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
                $novaDataFim,
                $alterouDadosComPreco,
                $pagamentoService
            ) {
                $reservaBloqueada = Reserva::whereKey($reserva->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $reservaBloqueada->update([
                    'data' => $dadosValidados['data'],
                    'data_fim' => $novaDataFim,
                    'periodo_id' => $dadosValidados['periodo_id'],
                    'secretaria_id' => $dadosValidados['secretaria_id'],
                    'observacoes' =>
                    $dadosValidados['observacoes'] ?? null,
                ]);

                // data_fim já foi recalculada acima (RES-03) para manter a
                // mesma duração da reserva original — o intervalo ocupado
                // em reserva_dias é sempre regenerado a partir da data
                // nova até essa data_fim nova (ver o mesmo padrão em
                // Admin\ReservaController::update()).
                ReservaDia::where('reserva_id', $reservaBloqueada->id)->delete();

                $periodoAtualizado = Periodo::findOrFail(
                    $dadosValidados['periodo_id']
                );

                $diasOcupados = $this->disponibilidade->gerarDiasOcupados(
                    $reservaBloqueada->data->format('Y-m-d'),
                    ($reservaBloqueada->data_fim ?? $reservaBloqueada->data)->format('Y-m-d'),
                    $periodoAtualizado->nome
                );

                ReservaDia::insert(array_map(
                    fn (array $dia) => [
                        'reserva_id' => $reservaBloqueada->id,
                        'secretaria_id' => $reservaBloqueada->secretaria_id,
                        'user_id' => $reservaBloqueada->user_id,
                        'dia' => $dia['dia'],
                        'slot' => $dia['slot'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $diasOcupados
                ));

                if ($alterouDadosComPreco) {
                    $pagamentoService->atualizarValorParaReserva(
                        $reservaBloqueada
                    );
                }
            });
        } catch (QueryException $e) {
            return $this->respostaConflitoReserva($e);
        }

        ActivityLogger::log(
            Auth::user(),
            'reserva_editada',
            $this->descreverReserva($reserva->refresh())
        );

        return redirect()
            ->route('reservas.index')
            ->with('success', __('Reserva atualizada com sucesso.'));
    }

    /**
     * Descrição legível de uma reserva para o Registo de Atividade —
     * "{setor} {código da secretária} · {data} · {período}".
     */
    private function descreverReserva(Reserva $reserva): string
    {
        $reserva->loadMissing(['secretaria.setor', 'periodo']);

        return sprintf(
            '%s %s · %s · %s',
            $reserva->secretaria?->setor?->nome ?? '-',
            $reserva->secretaria?->codigo ?? '-',
            $reserva->data->format('d/m/Y'),
            $reserva->periodo?->nome ?? '-'
        );
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
                'secretaria_id' => __('Este lugar acabou de ser reservado por outra pessoa. Escolhe outro período ou lugar.'),
            ])
            ->withInput();
    }
}
