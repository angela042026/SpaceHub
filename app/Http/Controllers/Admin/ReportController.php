<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EstadoReserva;
use App\Models\PedidoSuporte;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private const POR_PAGINA = 20;

    public function index(): Response
    {
        $this->autorizarAcessoRelatorios();

        return Inertia::render('Admin/Reports/Index');
    }

    public function reservas(Request $request): Response
    {
        $this->autorizarAcessoRelatorios();

        $this->validarIntervaloDeDatas($request);

        $request->validate([
            'estado_reserva_id' => ['sometimes', 'nullable', 'integer', 'exists:estado_reservas,id'],
        ]);

        $query = Reserva::query()
            ->with(['user', 'secretaria.setor.piso.edificio', 'periodo', 'estadoReserva']);

        if ($request->filled('data_inicio')) {
            $query->whereDate('data', '>=', $request->input('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data', '<=', $request->input('data_fim'));
        }

        if ($request->filled('estado_reserva_id')) {
            $query->where('estado_reserva_id', $request->integer('estado_reserva_id'));
        }

        $reservas = $query
            ->orderByDesc('data')
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return Inertia::render('Admin/Reports/Reservas', [
            'reservas' => $reservas,
            'estados' => EstadoReserva::orderBy('nome')->get(['id', 'nome', 'codigo']),
            'filters' => $request->only(['data_inicio', 'data_fim', 'estado_reserva_id']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function utilizadores(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $request->validate([
            'role_id' => ['sometimes', 'nullable', 'integer', 'exists:roles,id'],
        ]);

        $query = User::query()->with('role');

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $utilizadores = $query
            ->orderBy('name')
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return Inertia::render('Admin/Reports/Utilizadores', [
            'utilizadores' => $utilizadores,
            'roles' => Role::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['role_id', 'ativo']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function suporte(Request $request): Response
    {
        $this->autorizarAcessoRelatorios();

        $query = PedidoSuporte::query()->with('user');

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $pedidos = $query
            ->orderByDesc('created_at')
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return Inertia::render('Admin/Reports/Suporte', [
            'pedidos' => $pedidos,
            'filters' => $request->only(['estado']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function ocupacao(Request $request): Response
    {
        $this->autorizarAcessoRelatorios();

        $this->validarIntervaloDeDatas($request);

        $request->validate([
            'piso_id' => ['sometimes', 'nullable', 'integer', 'exists:pisos,id'],
        ]);

        $dataFim = $request->filled('data_fim')
            ? Carbon::parse($request->input('data_fim'))
            : now();

        $dataInicio = $request->filled('data_inicio')
            ? Carbon::parse($request->input('data_inicio'))
            : $dataFim->copy()->subDays(13);

        // Cada dia do relatório é uma query própria (mesma fórmula de
        // DashboardMetricsService::calcularOcupacaoDoDia(), que depende
        // do scope noIntervalo() para contar corretamente reservas que
        // atravessam vários dias) — por isso o intervalo é limitado a
        // 60 dias, para não gerar centenas de queries sequenciais.
        if ($dataInicio->diffInDays($dataFim) > 59) {
            $dataInicio = $dataFim->copy()->subDays(59);
        }

        $pisoId = $request->filled('piso_id') ? $request->integer('piso_id') : null;

        $totalSecretarias = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->when($pisoId, fn ($query) => $query->whereHas(
                'setor',
                fn ($setorQuery) => $setorQuery->where('piso_id', $pisoId)
            ))
            ->count();

        $idsEstadosAtivos = EstadoReserva::idsAtivos();

        $linhas = [];
        $dia = $dataInicio->copy();

        while ($dia->lte($dataFim)) {
            $secretariasOcupadas = Reserva::query()
                ->noIntervalo($dia)
                ->whereIn('estado_reserva_id', $idsEstadosAtivos)
                ->when($pisoId, fn ($query) => $query->whereHas(
                    'secretaria.setor',
                    fn ($setorQuery) => $setorQuery->where('piso_id', $pisoId)
                ))
                ->distinct()
                ->count('secretaria_id');

            $linhas[] = [
                'data' => $dia->toDateString(),
                'secretariasOcupadas' => $secretariasOcupadas,
                'totalSecretarias' => $totalSecretarias,
                'taxaOcupacao' => $totalSecretarias > 0
                    ? round($secretariasOcupadas / $totalSecretarias * 100, 1)
                    : 0.0,
            ];

            $dia->addDay();
        }

        $linhas = array_reverse($linhas);

        // $linhas vem de um ciclo em PHP, não de uma query — por isso a
        // paginação é construída manualmente com o mesmo LengthAwarePaginator
        // que o Eloquent usa por trás de ->paginate(), preservando o
        // querystring (filtros de data/piso) nos links Anterior/Seguinte.
        $paginaAtual = LengthAwarePaginator::resolveCurrentPage();
        $linhasPaginadas = new LengthAwarePaginator(
            array_slice($linhas, ($paginaAtual - 1) * self::POR_PAGINA, self::POR_PAGINA),
            count($linhas),
            self::POR_PAGINA,
            $paginaAtual,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Admin/Reports/Ocupacao', [
            'linhas' => $linhasPaginadas,
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get(['id', 'nome']),
            'filters' => [
                'data_inicio' => $dataInicio->toDateString(),
                'data_fim' => $dataFim->toDateString(),
                'piso_id' => $pisoId,
            ],
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function espacos(Request $request): Response
    {
        $this->autorizarAcessoRelatorios();

        $this->validarIntervaloDeDatas($request);

        $request->validate([
            'piso_id' => ['sometimes', 'nullable', 'integer', 'exists:pisos,id'],
            'setor_id' => ['sometimes', 'nullable', 'integer', 'exists:setores,id'],
        ]);

        $dataFim = $request->filled('data_fim')
            ? Carbon::parse($request->input('data_fim'))
            : now();

        $dataInicio = $request->filled('data_inicio')
            ? Carbon::parse($request->input('data_inicio'))
            : $dataFim->copy()->subDays(29);

        $pisoId = $request->filled('piso_id') ? $request->integer('piso_id') : null;
        $setorId = $request->filled('setor_id') ? $request->integer('setor_id') : null;

        // REL-03: mede ocupação real (dias efetivamente ocupados no
        // período), não número de reservas — uma reserva anual conta
        // até 365 dias aqui, não 1. reserva_dias já é a fonte exata
        // disto: fica sempre com uma linha por dia+slot genuinamente
        // ocupado (pendente/confirmada/concluída/não compareceu), e
        // perde a linha quando o dia é cancelado/expirado ou libertado
        // por falta de check-in (ver LiberarReservasSemCheckIn) — por
        // isso não precisa de filtrar por estado aqui, ao contrário do
        // withCount em Reserva que este substituiu.
        $diasOcupadosPorSecretaria = ReservaDia::query()
            ->whereDate('dia', '>=', $dataInicio)
            ->whereDate('dia', '<=', $dataFim)
            ->selectRaw('secretaria_id, COUNT(DISTINCT dia) as total')
            ->groupBy('secretaria_id')
            ->get()
            ->keyBy('secretaria_id');

        $secretarias = Secretaria::query()
            ->with(['setor.piso.edificio'])
            ->when($pisoId, fn ($query) => $query->whereHas(
                'setor',
                fn ($setorQuery) => $setorQuery->where('piso_id', $pisoId)
            ))
            ->when($setorId, fn ($query) => $query->where('setor_id', $setorId))
            ->get()
            ->map(fn ($secretaria) => [
                'id' => $secretaria->id,
                'codigo' => $secretaria->codigo,
                'setor' => $secretaria->setor?->nome,
                'piso' => $secretaria->setor?->piso?->nome,
                'edificio' => $secretaria->setor?->piso?->edificio?->nome,
                'diasOcupados' => (int) ($diasOcupadosPorSecretaria->get($secretaria->id)->total ?? 0),
            ])
            ->sortByDesc('diasOcupados')
            ->values();

        // A percentagem de cada linha é sempre relativa ao total geral, não
        // só à página atual — por isso este total é calculado à parte, antes
        // de paginar.
        $totalDiasOcupados = (int) $secretarias->sum('diasOcupados');

        $linhas = $secretarias
            ->map(fn (array $linha) => [
                ...$linha,
                'percentual' => $totalDiasOcupados > 0
                    ? round($linha['diasOcupados'] / $totalDiasOcupados * 100, 1)
                    : 0.0,
            ])
            ->all();

        // $linhas vem de uma Collection agregada em PHP, não de uma query
        // paginável diretamente — mesmo padrão de paginação manual já
        // usado em ocupacao().
        $paginaAtual = LengthAwarePaginator::resolveCurrentPage();
        $linhasPaginadas = new LengthAwarePaginator(
            array_slice($linhas, ($paginaAtual - 1) * self::POR_PAGINA, self::POR_PAGINA),
            count($linhas),
            self::POR_PAGINA,
            $paginaAtual,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Admin/Reports/Espacos', [
            'linhas' => $linhasPaginadas,
            'pisos' => Piso::where('ativo', true)->orderBy('numero')->get(['id', 'nome']),
            'setores' => Setor::where('ativo', true)->orderBy('nome')->get(['id', 'nome']),
            'filters' => [
                'data_inicio' => $dataInicio->toDateString(),
                'data_fim' => $dataFim->toDateString(),
                'piso_id' => $pisoId,
                'setor_id' => $setorId,
            ],
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function cancelamentos(Request $request): Response
    {
        $this->autorizarAcessoRelatorios();

        $this->validarIntervaloDeDatas($request);

        $request->validate([
            'estado_reserva_id' => ['sometimes', 'nullable', 'integer', 'exists:estado_reservas,id'],
            'setor_id' => ['sometimes', 'nullable', 'integer', 'exists:setores,id'],
        ]);

        $idsRelevantes = EstadoReserva::query()
            ->whereIn('codigo', ['cancelada', 'nao_compareceu'])
            ->pluck('id');

        $query = Reserva::query()
            ->with(['user', 'secretaria.setor.piso.edificio', 'estadoReserva'])
            ->whereIn('estado_reserva_id', $idsRelevantes);

        if ($request->filled('data_inicio')) {
            $query->whereDate('data', '>=', $request->input('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data', '<=', $request->input('data_fim'));
        }

        if ($request->filled('estado_reserva_id') && $idsRelevantes->contains($request->integer('estado_reserva_id'))) {
            $query->where('estado_reserva_id', $request->integer('estado_reserva_id'));
        }

        if ($request->filled('utilizador')) {
            $termo = $request->input('utilizador');
            $query->whereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$termo}%"));
        }

        if ($request->filled('setor_id')) {
            $setorId = $request->integer('setor_id');
            $query->whereHas('secretaria.setor', fn ($setorQuery) => $setorQuery->where('id', $setorId));
        }

        $reservas = $query
            ->orderByDesc('data')
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return Inertia::render('Admin/Reports/CancelamentosAusencias', [
            'reservas' => $reservas,
            'estados' => EstadoReserva::whereIn('codigo', ['cancelada', 'nao_compareceu'])->orderBy('nome')->get(['id', 'nome', 'codigo']),
            'setores' => Setor::where('ativo', true)->orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['data_inicio', 'data_fim', 'estado_reserva_id', 'utilizador', 'setor_id']),
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }

    /**
     * Valida o par data_inicio/data_fim usado pelos relatórios de
     * intervalo — sem isto, uma data mal formada (ex.: "abc") rebentava
     * com `Carbon::parse()` (erro 500 em vez de mensagem de validação),
     * e um intervalo invertido (data_fim antes de data_inicio) não era
     * rejeitado, só produzia um resultado vazio sem explicação.
     */
    private function validarIntervaloDeDatas(Request $request): void
    {
        $request->validate([
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date'],
        ]);

        if (
            $request->filled('data_inicio')
            && $request->filled('data_fim')
            && Carbon::parse($request->input('data_inicio'))->gt(Carbon::parse($request->input('data_fim')))
        ) {
            throw ValidationException::withMessages([
                'data_fim' => 'A data final não pode ser anterior à data inicial.',
            ]);
        }
    }

    /**
     * Restringe o acesso aos relatórios (exceto "Utilizadores", que tem
     * a sua própria autorização mais restrita) a Administrador ou
     * Gestor.
     *
     * `SetorPolicy::viewAny()` devolve sempre true — não serve para
     * isto. Reaproveita-se `create` (já restrita a Administrador via
     * `before()`, ou Gestor via `isGestor()`), o mesmo padrão já usado
     * em `SecretariaQrCodeController`/`SetorMapaController` para o
     * mesmo tipo de verificação "é Administrador ou Gestor", em vez de
     * reimplementar a regra outra vez.
     */
    private function autorizarAcessoRelatorios(): void
    {
        Gate::authorize('create', Setor::class);
    }
}
