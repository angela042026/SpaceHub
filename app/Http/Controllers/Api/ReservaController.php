<?php

namespace App\Http\Controllers\Api;

use App\Events\MapaAtualizado;
use App\Http\Controllers\Controller;
use App\Http\Requests\DisponibilidadeReservaRequest;
use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Http\Resources\SecretariaResource;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Services\DashboardMetricsService;
use App\Services\PagamentoService;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use App\Notifications\ReservaCanceladaNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ReservaController extends Controller
{
    public function __construct(
        private ReservaDisponibilidadeService $disponibilidade
    ) {
    }

    /**
     * Lista reservas.
     *
     * O Administrador consulta todas.
     * Os restantes utilizadores consultam apenas as próprias.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Reserva::class);

        $query = Reserva::with([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ]);

        if (! $this->isAdministrador($request)) {
            $query->where('user_id', $request->user()->id);
        }

        $reservas = $query
            ->latest('data')
            ->latest('id')
            ->get();

        return ReservaResource::collection($reservas);
    }

    /**
     * Apresenta uma reserva.
     */
    public function show(Reserva $reserva): ReservaResource
    {
        Gate::authorize('view', $reserva);

        $this->carregarRelacoes($reserva);

        return new ReservaResource($reserva);
    }

    /**
     * Cria uma reserva para o utilizador autenticado.
     *
     * A criação é delegada no ReservaCriacaoService — o mesmo que o fluxo
     * web usa — para que os dois caminhos apliquem exatamente as mesmas
     * regras: transação, criação do pagamento pendente, preenchimento de
     * data_fim/tipo_duracao e tratamento de reservas em simultâneo.
     *
     * As violações de regra chegam como ValidationException e o Laravel
     * devolve-as em JSON com estado 422.
     */
    public function store(
        StoreReservaRequest $request,
        ReservaCriacaoService $criacao
    ): ReservaResource|JsonResponse {
        Gate::authorize('create', Reserva::class);

        $dados = $request->validated();
        $userId = $request->user()->id;

        $secretaria = Secretaria::query()
            ->findOrFail($dados['secretaria_id']);

        if (! $secretaria->ativo || ! $secretaria->reservavel) {
            return response()->json([
                'message' => 'A secretária selecionada não está disponível para reservas.',
            ], 422);
        }

        $periodo = Periodo::query()
            ->findOrFail($dados['periodo_id']);

        /*
         * O serviço trata o dia inteiro num método próprio, que ignora o
         * periodo_id recebido e usa sempre o período "Dia inteiro". A API
         * não expõe durações longas, por isso a duração é sempre diária.
         */
        $reserva = $periodo->nome === 'Dia inteiro'
            ? $criacao->criarDiaInteiro(
                $dados + ['tipo_duracao' => 'diaria'],
                $userId
            )
            : $criacao->criarMeioDia($dados, $userId);

        $this->carregarRelacoes($reserva);

        broadcast(new MapaAtualizado());
        DashboardMetricsService::limparCacheDoDia();

        return new ReservaResource($reserva);
    }

    /**
     * Atualiza uma reserva.
     *
     * Quando a secretária ou o período mudam, o valor do pagamento é
     * recalculado (PagamentoService::atualizarValorParaReserva) — antes
     * disto só o fluxo web fazia esse recálculo, e `pagamentos.valor`
     * podia ficar dessincronizado do preço real de quem editava a
     * reserva pela API.
     */
    public function update(
        UpdateReservaRequest $request,
        Reserva $reserva,
        PagamentoService $pagamentoService
    ): ReservaResource|JsonResponse {
        Gate::authorize('update', $reserva);

        $reserva->loadMissing('estadoReserva');

        if ($reserva->check_in_at !== null) {
            return response()->json([
                'message' => 'Não é possível alterar uma reserva que já realizou check-in.',
            ], 422);
        }

        if (
            in_array(
                $reserva->estadoReserva?->codigo,
                ['cancelada', 'expirada'],
                true
            )
        ) {
            return response()->json([
                'message' => 'O estado atual da reserva não permite alterações.',
            ], 422);
        }

        $dados = $request->validated();

        $secretariaId = (int) ($dados['secretaria_id']
            ?? $reserva->secretaria_id);

        $data = $dados['data']
            ?? $reserva->data->format('Y-m-d');

        $periodoId = (int) ($dados['periodo_id']
            ?? $reserva->periodo_id);

        $secretaria = Secretaria::query()
            ->findOrFail($secretariaId);

        if (! $secretaria->ativo || ! $secretaria->reservavel) {
            return response()->json([
                'message' => 'A secretária selecionada não está disponível para reservas.',
            ], 422);
        }

        $periodosConflito = $this->disponibilidade
            ->periodosEmConflito($periodoId);

        if ($this->disponibilidade->existeReservaAtivaNaData(
            'secretaria_id',
            $secretariaId,
            $periodosConflito,
            $data,
            $reserva->id
        )) {
            return response()->json([
                'message' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
            ], 422);
        }

        if ($this->disponibilidade->existeReservaAtivaNaData(
            'user_id',
            (int) $reserva->user_id,
            $periodosConflito,
            $data,
            $reserva->id
        )) {
            return response()->json([
                'message' => 'Este utilizador já possui outra reserva incompatível com este período.',
            ], 422);
        }

        $alterouDadosComPreco =
            (int) $reserva->periodo_id !== $periodoId
            || (int) $reserva->secretaria_id !== $secretariaId;

        try {
            DB::transaction(function () use (
                $reserva,
                $dados,
                $data,
                $periodoId,
                $secretariaId,
                $alterouDadosComPreco,
                $pagamentoService
            ) {
                $reservaBloqueada = Reserva::whereKey($reserva->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $reservaBloqueada->update([
                    'data' => $data,
                    'periodo_id' => $periodoId,
                    'secretaria_id' => $secretariaId,
                    'observacoes' => $dados['observacoes'] ?? $reservaBloqueada->observacoes,
                ]);

                if ($alterouDadosComPreco) {
                    $pagamentoService->atualizarValorParaReserva($reservaBloqueada);
                }
            });
        } catch (QueryException $e) {
            if (! $this->disponibilidade->ehConflitoDeReservaAtiva($e)) {
                throw $e;
            }

            return response()->json([
                'message' => 'Este lugar acabou de ser reservado por outra pessoa. Escolhe outro período ou lugar.',
            ], 422);
        }

        $reserva->refresh();

        $this->carregarRelacoes($reserva);

        broadcast(new MapaAtualizado());
        DashboardMetricsService::limparCacheDoDia();

        return new ReservaResource($reserva);
    }

    /**
     * Cancela uma reserva.
     */
    public function cancelar(
        Request $request,
        Reserva $reserva,
        PagamentoService $pagamentoService
    ): ReservaResource|JsonResponse {
        Gate::authorize('cancelar', $reserva);

        $reserva->loadMissing('estadoReserva');

        if (
            $reserva->cancelada_at !== null
            || $reserva->estadoReserva?->codigo === 'cancelada'
        ) {
            return response()->json([
                'message' => 'Esta reserva já se encontra cancelada.',
            ], 422);
        }

        if ($reserva->check_in_at !== null) {
            return response()->json([
                'message' => 'Não é possível cancelar uma reserva que já realizou check-in.',
            ], 422);
        }

        if (
            in_array(
                $reserva->estadoReserva?->codigo,
                ['confirmada', 'expirada'],
                true
            )
        ) {
            return response()->json([
                'message' => 'O estado atual da reserva não permite o cancelamento.',
            ], 422);
        }

        /*
         * O utilizador comum só pode cancelar reservas futuras.
         * O Administrador pode cancelar uma reserva ativa, desde que
         * ainda não tenha check-in e o estado permita o cancelamento.
         */
        if (
            ! $this->isAdministrador($request)
            && ! $reserva->data->isFuture()
        ) {
            return response()->json([
                'message' => 'Apenas reservas futuras podem ser canceladas.',
            ], 422);
        }

        $estadoCancelada = $this->obterEstado('cancelada');

        /*
         * O cancelamento do pagamento passa pelo PagamentoService, tal
         * como no fluxo web: é ele que põe um pagamento pendente em
         * cancelado e que recusa cancelar uma reserva já paga enquanto
         * não houver reembolso. Sem isto a reserva era cancelada e o
         * pagamento ficava pendente para sempre.
         *
         * A transação com lockForUpdate evita que dois pedidos em
         * simultâneo cancelem a mesma reserva duas vezes.
         */
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

        $reserva->refresh();

        $this->carregarRelacoes($reserva);

        $reserva->user->notify(new ReservaCanceladaNotification($reserva));

        broadcast(new MapaAtualizado());
        DashboardMetricsService::limparCacheDoDia();

        return new ReservaResource($reserva);
    }

    /**
     * Lista secretárias disponíveis.
     */
    public function disponibilidade(
        DisponibilidadeReservaRequest $request
    ): AnonymousResourceCollection {
        Gate::authorize('viewAny', Reserva::class);

        $dados = $request->validated();

        return SecretariaResource::collection(
            $this->disponibilidade->secretariasDisponiveis(
                $dados['data'],
                $dados['periodo_id']
            )
        );
    }

    /**
     * Carrega as relações da reserva.
     */
    private function carregarRelacoes(Reserva $reserva): void
    {
        $reserva->load([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ]);
    }




    /**
     * Obtém um estado de reserva pelo código.
     */
    private function obterEstado(string $codigo): EstadoReserva
    {
        return EstadoReserva::query()
            ->where('codigo', $codigo)
            ->firstOrFail();
    }

    /**
     * Verifica se o utilizador autenticado é Administrador.
     */
    private function isAdministrador(Request $request): bool
    {
        return $request->user()->role?->nome === 'Administrador';
    }
}