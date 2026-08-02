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
use App\Notifications\ReservaCanceladaNotification;
use App\Notifications\ReservaCriadaNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use App\Models\Edificio;

class ReservaController extends Controller
{
    /**
     * Lista reservas.
     *
     * O Administrador consulta todas.
     * Os restantes utilizadores consultam apenas as próprias.
     */
    public function create()
    {
        return Inertia::render('Reservas/Create', [
            'edificios' => Edificio::with('pisos.setores.secretarias')->get(),
            'periodos' => Periodo::all(),
        ]);
    }
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Reserva::class);

        $query = Reserva::with([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ]);

        if (!$this->isAdministrador($request)) {
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
     */
    public function store(
        StoreReservaRequest $request
    ): ReservaResource|JsonResponse {
        Gate::authorize('create', Reserva::class);

        $dados = $request->validated();
        $userId = $request->user()->id;

        $secretaria = Secretaria::query()
            ->findOrFail($dados['secretaria_id']);

        if (!$secretaria->ativo || !$secretaria->reservavel) {
            return response()->json([
                'message' => 'A secretária selecionada não está disponível para reservas.',
            ], 422);
        }

        if (
            $this->secretariaJaReservada(
                $dados['secretaria_id'],
                $dados['data'],
                $dados['periodo_id']
            )
        ) {
            return response()->json([
                'message' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
            ], 422);
        }

        if (
            $this->utilizadorJaTemReserva(
                $userId,
                $dados['data'],
                $dados['periodo_id']
            )
        ) {
            return response()->json([
                'message' => 'Já possui uma reserva incompatível com este período na data selecionada.',
            ], 422);
        }

        $estadoPendente = $this->obterEstado('pendente');

        $reserva = Reserva::create([
            'user_id' => $userId,
            'secretaria_id' => $dados['secretaria_id'],
            'periodo_id' => $dados['periodo_id'],
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $dados['data'],
            'observacoes' => $dados['observacoes'] ?? null,
        ]);

        $this->carregarRelacoes($reserva);

        $reserva->user->notify(new ReservaCriadaNotification($reserva));

        broadcast(new MapaAtualizado());

        return new ReservaResource($reserva);
    }

    /**
     * Atualiza uma reserva.
     */
    public function update(
        UpdateReservaRequest $request,
        Reserva $reserva
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

        $secretariaId = $dados['secretaria_id']
            ?? $reserva->secretaria_id;

        $data = $dados['data']
            ?? $reserva->data->format('Y-m-d');

        $periodoId = $dados['periodo_id']
            ?? $reserva->periodo_id;

        $secretaria = Secretaria::query()
            ->findOrFail($secretariaId);

        if (!$secretaria->ativo || !$secretaria->reservavel) {
            return response()->json([
                'message' => 'A secretária selecionada não está disponível para reservas.',
            ], 422);
        }

        if (
            $this->secretariaJaReservada(
                $secretariaId,
                $data,
                $periodoId,
                $reserva->id
            )
        ) {
            return response()->json([
                'message' => 'Esta secretária já se encontra reservada para a data e período selecionados.',
            ], 422);
        }

        if (
            $this->utilizadorJaTemReserva(
                $reserva->user_id,
                $data,
                $periodoId,
                $reserva->id
            )
        ) {
            return response()->json([
                'message' => 'Este utilizador já possui outra reserva incompatível com este período.',
            ], 422);
        }

        $reserva->update($dados);

        $this->carregarRelacoes($reserva);

        broadcast(new MapaAtualizado());

        return new ReservaResource($reserva);
    }

    /**
     * Cancela uma reserva.
     */
    public function cancelar(
        Request $request,
        Reserva $reserva
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
            !$this->isAdministrador($request)
            && !$reserva->data->isFuture()
        ) {
            return response()->json([
                'message' => 'Apenas reservas futuras podem ser canceladas.',
            ], 422);
        }

        $estadoCancelada = $this->obterEstado('cancelada');

        $reserva->update([
            'estado_reserva_id' => $estadoCancelada->id,
            'cancelada_at' => now(),
        ]);

        $this->carregarRelacoes($reserva);

        $reserva->user->notify(new ReservaCanceladaNotification($reserva));

        broadcast(new MapaAtualizado());

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

        $periodosConflito = $this->periodosEmConflito(
            (int) $dados['periodo_id']
        );

        $secretariasReservadas = Reserva::query()
            ->whereDate('data', $dados['data'])
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereHas('estadoReserva', function ($query): void {
                $query->whereNotIn('codigo', [
                    'cancelada',
                    'expirada',
                ]);
            })
            ->pluck('secretaria_id');

        $secretarias = Secretaria::query()
            ->where('reservavel', true)
            ->where('ativo', true)
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();

        return SecretariaResource::collection($secretarias);
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
     * Verifica se a secretária já possui uma reserva incompatível.
     */
    private function secretariaJaReservada(
        int $secretariaId,
        string $data,
        int $periodoId,
        ?int $ignorarReservaId = null
    ): bool {
        $periodosConflito = $this->periodosEmConflito($periodoId);

        $query = Reserva::query()
            ->where('secretaria_id', $secretariaId)
            ->whereDate('data', $data)
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereHas('estadoReserva', function ($query): void {
                $query->whereNotIn('codigo', [
                    'cancelada',
                    'expirada',
                ]);
            });

        if ($ignorarReservaId !== null) {
            $query->whereKeyNot($ignorarReservaId);
        }

        return $query->exists();
    }

    /**
     * Verifica se o utilizador já possui outra reserva incompatível.
     */
    private function utilizadorJaTemReserva(
        int $userId,
        string $data,
        int $periodoId,
        ?int $ignorarReservaId = null
    ): bool {
        $periodosConflito = $this->periodosEmConflito($periodoId);

        $query = Reserva::query()
            ->where('user_id', $userId)
            ->whereDate('data', $data)
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereHas('estadoReserva', function ($query): void {
                $query->whereNotIn('codigo', [
                    'cancelada',
                    'expirada',
                ]);
            });

        if ($ignorarReservaId !== null) {
            $query->whereKeyNot($ignorarReservaId);
        }

        return $query->exists();
    }

    /**
     * Devolve os IDs dos períodos incompatíveis
     * com o período escolhido.
     *
     * Manhã:
     * - Manhã
     * - Dia inteiro
     *
     * Tarde:
     * - Tarde
     * - Dia inteiro
     *
     * Dia inteiro:
     * - Manhã
     * - Tarde
     * - Dia inteiro
     */
    private function periodosEmConflito(int $periodoId): array
    {
        $periodoSelecionado = Periodo::query()
            ->findOrFail($periodoId);

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

        return Periodo::query()
            ->whereIn('nome', $nomesPeriodos)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();
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
