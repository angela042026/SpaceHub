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
use App\Models\Reserva;
use App\Models\Secretaria;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ReservaController extends Controller
{
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
            ->latest()
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
    public function store(StoreReservaRequest $request): ReservaResource|JsonResponse
    {
        Gate::authorize('create', Reserva::class);

        $dados = $request->validated();
        $userId = $request->user()->id;

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
                'message' => 'Já possui uma reserva para esta data e período.',
            ], 422);
        }

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')
            ->firstOrFail();

        $reserva = Reserva::create([
            'user_id' => $userId,
            'secretaria_id' => $dados['secretaria_id'],
            'periodo_id' => $dados['periodo_id'],
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $dados['data'],
            'observacoes' => $dados['observacoes'] ?? null,
        ]);

        $this->carregarRelacoes($reserva);

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

        $dados = $request->validated();

        $secretariaId = $dados['secretaria_id']
            ?? $reserva->secretaria_id;

        $data = $dados['data']
            ?? $reserva->data->format('Y-m-d');

        $periodoId = $dados['periodo_id']
            ?? $reserva->periodo_id;

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
                'message' => 'Este utilizador já possui uma reserva para esta data e período.',
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
    public function cancelar(Reserva $reserva): ReservaResource|JsonResponse
    {
        Gate::authorize('cancelar', $reserva);

        if ($reserva->cancelada_at !== null) {
            return response()->json([
                'message' => 'Esta reserva já se encontra cancelada.',
            ], 422);
        }

        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')
            ->firstOrFail();

        $reserva->update([
            'estado_reserva_id' => $estadoCancelada->id,
            'cancelada_at' => now(),
        ]);

        $this->carregarRelacoes($reserva);

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

        $secretariasReservadas = Reserva::where('data', $dados['data'])
            ->where('periodo_id', $dados['periodo_id'])
            ->whereNull('cancelada_at')
            ->pluck('secretaria_id');

        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->whereNotIn('id', $secretariasReservadas)
            ->orderBy('codigo')
            ->get();

        return SecretariaResource::collection($secretarias);
    }

    private function carregarRelacoes(Reserva $reserva): void
    {
        $reserva->load([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
        ]);
    }

    private function secretariaJaReservada(
        int $secretariaId,
        string $data,
        int $periodoId,
        ?int $ignorarReservaId = null
    ): bool {
        $query = Reserva::where('secretaria_id', $secretariaId)
            ->where('data', $data)
            ->where('periodo_id', $periodoId)
            ->whereNull('cancelada_at');

        if ($ignorarReservaId !== null) {
            $query->where('id', '!=', $ignorarReservaId);
        }

        return $query->exists();
    }

    private function utilizadorJaTemReserva(
        int $userId,
        string $data,
        int $periodoId,
        ?int $ignorarReservaId = null
    ): bool {
        $query = Reserva::where('user_id', $userId)
            ->where('data', $data)
            ->where('periodo_id', $periodoId)
            ->whereNull('cancelada_at');

        if ($ignorarReservaId !== null) {
            $query->where('id', '!=', $ignorarReservaId);
        }

        return $query->exists();
    }

    private function isAdministrador(Request $request): bool
    {
        return $request->user()->role?->nome === 'Administrador';
    }
}