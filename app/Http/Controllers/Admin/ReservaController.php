<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReservaRequest;
use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Notifications\ReservaCanceladaNotification;
use App\Services\ActivityLogger;
use App\Services\PagamentoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    public function __construct(
        private ReservaDisponibilidadeService $disponibilidade
    ) {
    }

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

        // Só 15/25/50 são aceites — qualquer outro valor (ou nenhum) cai
        // para 15, para não permitir pedir uma página arbitrariamente
        // grande via query string.
        $perPage = in_array($request->integer('per_page'), [15, 25, 50], true)
            ? $request->integer('per_page')
            : 15;

        $reservas = $query
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Reservas/Index', [
            'reservas' => $reservas,
            'estados' => EstadoReserva::orderBy('nome')->get(['id', 'nome', 'codigo']),
            'edificios' => Edificio::where('ativo', true)->orderBy('nome')->get(),
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get()
                ->each(fn (Piso $piso) => $piso->nome = $piso->nome_localizado),
            'setores' => Setor::where('reservavel', true)->orderBy('nome')->get()
                ->each(fn (Setor $setor) => $setor->nome = $setor->nome_localizado),
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
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get()
                ->each(fn (Piso $piso) => $piso->nome = $piso->nome_localizado),
            'setores' => Setor::where('reservavel', true)->with('piso')->orderBy('piso_id')->orderBy('nome')->get()
                ->each(fn (Setor $setor) => $setor->nome = $setor->nome_localizado),
            'secretarias' => Secretaria::where('reservavel', true)
                ->where('ativo', true)
                ->with('setor.piso')
                ->orderBy('codigo')
                ->get(),
        ]);
    }

    /**
     * Atualiza uma reserva (qualquer utilizador), reutilizando a mesma
     * verificação de conflito e o mesmo recálculo de preço do fluxo web
     * (ReservaDisponibilidadeService / PagamentoService) — antes disto
     * eram implementados aqui à parte, com uma verificação de conflito
     * mais simples e sem recalcular o valor do pagamento quando a
     * secretária/período mudavam.
     */
    public function update(
        UpdateReservaRequest $request,
        Reserva $reserva,
        PagamentoService $pagamentoService
    ): RedirectResponse {
        Gate::authorize('update', $reserva);

        $dados = $request->validated();

        $data = $dados['data'] ?? $reserva->data->format('Y-m-d');
        $periodoId = (int) ($dados['periodo_id'] ?? $reserva->periodo_id);
        $secretariaId = (int) ($dados['secretaria_id'] ?? $reserva->secretaria_id);

        $periodosConflito = $this->disponibilidade->periodosEmConflito($periodoId);

        // RES-03: preserva o número de dias original ao mudar só a data de
        // início — sem isto, data_fim ficava parada no valor antigo e a
        // duração de uma reserva de vários dias mudava silenciosamente (ou
        // ficava invertida, se a nova data de início passasse a antiga
        // data_fim).
        $duracaoDias = $reserva->data->diffInDays(
            $reserva->data_fim ?? $reserva->data
        );
        $novaDataFim = Carbon::parse($data)->addDays($duracaoDias)->toDateString();

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'secretaria_id',
            $secretariaId,
            $periodosConflito,
            $data,
            $novaDataFim,
            $reserva->id
        )) {
            return back()
                ->withErrors([
                    'secretaria_id' => __('Esta secretária já se encontra reservada para a data e período selecionados.'),
                ])
                ->withInput();
        }

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'user_id',
            (int) $reserva->user_id,
            $periodosConflito,
            $data,
            $novaDataFim,
            $reserva->id
        )) {
            return back()
                ->withErrors([
                    'data' => __('Este utilizador já possui outra reserva para esta data e período.'),
                ])
                ->withInput();
        }

        $alterouDadosComPreco =
            (int) $reserva->periodo_id !== $periodoId
            || (int) $reserva->secretaria_id !== $secretariaId;

        try {
            DB::transaction(function () use (
                $reserva,
                $data,
                $novaDataFim,
                $periodoId,
                $secretariaId,
                $dados,
                $alterouDadosComPreco,
                $pagamentoService
            ) {
                $reservaBloqueada = Reserva::whereKey($reserva->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $reservaBloqueada->update([
                    'data' => $data,
                    'data_fim' => $novaDataFim,
                    'periodo_id' => $periodoId,
                    'secretaria_id' => $secretariaId,
                    'observacoes' => $dados['observacoes'] ?? $reservaBloqueada->observacoes,
                ]);

                // data_fim já foi recalculada acima (RES-03) para manter a
                // mesma duração da reserva original — o intervalo ocupado
                // em reserva_dias é sempre regenerado a partir da data
                // nova até essa data_fim nova. Sem isto, as linhas antigas
                // (secretária/dia anteriores) ficavam paradas e as novas
                // nunca ficavam protegidas pela constraint.
                ReservaDia::where('reserva_id', $reservaBloqueada->id)->delete();

                $periodoAtualizado = Periodo::findOrFail($periodoId);

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
                    $pagamentoService->atualizarValorParaReserva($reservaBloqueada);
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
            ->route('admin.reservas.index')
            ->with('success', __('Reserva atualizada com sucesso.'));
    }

    /**
     * Cancela uma reserva de qualquer utilizador, cancelando também o
     * pagamento associado — antes disto só atualizava o estado da
     * reserva, sem transação nem lock, deixando o pagamento "pago" numa
     * reserva já cancelada.
     */
    public function cancelar(
        Reserva $reserva,
        PagamentoService $pagamentoService
    ): RedirectResponse {
        Gate::authorize('cancelar', $reserva);

        if ($reserva->cancelada_at !== null) {
            return redirect()
                ->route('admin.reservas.index')
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

        return redirect()
            ->route('admin.reservas.index')
            ->with(
                'success',
                'Reserva e pagamento cancelados com sucesso.'
            );
    }

    /**
     * Descrição legível de uma reserva para o Registo de Atividade —
     * "{utilizador} · {código da secretária} · {data}".
     */
    private function descreverReserva(Reserva $reserva): string
    {
        $reserva->loadMissing(['user', 'secretaria']);

        return sprintf(
            '%s · %s · %s',
            $reserva->user?->name ?? '-',
            $reserva->secretaria?->codigo ?? '-',
            $reserva->data->format('d/m/Y')
        );
    }

    /**
     * Traduz uma violação do índice único de reservas ativas (corrida
     * entre pedidos em simultâneo) numa resposta amigável. Qualquer
     * outro erro de base de dados é relançado, para não mascarar
     * problemas reais.
     */
    private function respostaConflitoReserva(QueryException $e): RedirectResponse
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
