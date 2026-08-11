<?php

namespace App\Services;

use App\Models\Avaliacao;
use App\Models\Periodo;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Setor;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Consulta de disponibilidade de secretárias e verificação de conflitos
 * de reserva. Extraído de ReservaController — usado pelo fluxo web
 * (Inertia) e preparado para o Api\ReservaController vir a usar a mesma
 * lógica em vez de a duplicar.
 */
class ReservaDisponibilidadeService
{
    /**
     * Colunas booleanas de características filtráveis nas secretárias.
     * Único sítio a atualizar caso uma nova característica seja adicionada.
     */
    public const CARACTERISTICAS_FILTRAVEIS = [
        'monitor',
        'dock_usb',
        'hdmi',
        'ergonomica',
        'junto_janela',
        'luz_natural',
        'zona_silenciosa',
        'proximo_copa',
    ];

    /**
     * Períodos ativos, exceto Dia inteiro (usados na grelha Manhã/Tarde).
     */
    public function periodosReservaAtivos()
    {
        return Periodo::where('ativo', true)
            ->where('nome', '!=', 'Dia inteiro')
            ->orderBy('hora_inicio')
            ->get();
    }

    /**
     * Todos os períodos ativos, incluindo Dia inteiro — usado onde o
     * frontend precisa de saber o id do período "Dia inteiro" (ex.:
     * Reservas/Edit.jsx, para permitir voltar a escolhê-lo).
     */
    public function periodosAtivos()
    {
        return Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();
    }

    /**
     * Pisos ativos disponíveis para reserva (exclui a garagem).
     */
    public function pisosAtivosParaReserva()
    {
        return Piso::where('ativo', true)
            ->where('numero', '>=', 0)
            ->orderBy('numero')
            ->get();
    }

    /**
     * Setores (tipos de espaço) reserváveis, com o piso carregado —
     * usados no fluxo Piso -> Categoria -> Lugar do formulário.
     *
     * Traz também a contagem e a média das avaliações aprovadas, que a
     * página de nova reserva mostra em estrelas por baixo do espaço
     * escolhido.
     */
    public function setoresReservaveis()
    {
        return Setor::where('reservavel', true)
            ->with('piso')
            ->select('setores.*')
            ->selectSub(
                $this->avaliacoesAprovadasDoSetor()
                    ->selectRaw('count(*)'),
                'avaliacao_total'
            )
            ->selectSub(
                $this->avaliacoesAprovadasDoSetor()
                    ->selectRaw('avg(avaliacoes.nota)'),
                'avaliacao_media'
            )
            ->orderBy('piso_id')
            ->orderBy('nome')
            ->get();
    }

    /**
     * Avaliações aprovadas do setor da linha exterior.
     *
     * As avaliações estão a três saltos do setor
     * (setor -> secretária -> reserva -> avaliação), o que ultrapassa o
     * alcance de um hasManyThrough. Fica uma subconsulta correlacionada,
     * ligada ao setor de fora pelo whereColumn.
     */
    private function avaliacoesAprovadasDoSetor()
    {
        return Avaliacao::query()
            ->join(
                'reservas',
                'avaliacoes.reserva_id',
                '=',
                'reservas.id'
            )
            ->join(
                'secretarias',
                'reservas.secretaria_id',
                '=',
                'secretarias.id'
            )
            ->whereColumn('secretarias.setor_id', 'setores.id')
            ->where('avaliacoes.estado', 'aprovada');
    }

    /**
     * Lê as preferências de características filtráveis de um pedido,
     * uma por chave em CARACTERISTICAS_FILTRAVEIS.
     */
    public function preferenciasDaRequisicao(Request $request): array
    {
        $preferencias = [];

        foreach (self::CARACTERISTICAS_FILTRAVEIS as $caracteristica) {
            $preferencias[$caracteristica] = $request->boolean($caracteristica);
        }

        return $preferencias;
    }

    /**
     * Lugares reserváveis e ativos sem reserva ativa numa data/período.
     *
     * Quando $setorId é omitido, devolve a disponibilidade em todas as
     * categorias (usado pela consulta geral); quando indicado, restringe
     * à categoria selecionada (usado pelo fluxo Piso -> Categoria -> Lugar).
     */
    public function secretariasDisponiveis(
        string $data,
        int|string $periodoId,
        int|string|null $setorId = null
    ) {
        $periodosConflito = $this->periodosEmConflito((int) $periodoId);

        $secretariasReservadas = $this->reservasQueOcupam($data)
            ->whereIn('periodo_id', $periodosConflito)
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
     * Lugares reserváveis e ativos, cada um com um mapa
     * periodo_id => disponível (bool) para a data indicada.
     *
     * $setorId e $pisoId são ambos opcionais: quando omitidos, devolve
     * lugares de todas as categorias/pisos — usado pela página "Nova
     * Reserva", que já não obriga a escolher um piso e uma categoria
     * antes de mostrar resultados.
     */
    public function secretariasComDisponibilidade(
        string $data,
        int|string|null $setorId = null,
        array $preferencias = [],
        ?int $excluirReservaId = null,
        int|string|null $pisoId = null
    ) {
        $periodos = $this->periodosReservaAtivos();

        $secretarias = $this->secretariasFiltradasPorPreferencias(
            $setorId,
            $pisoId,
            $preferencias
        );

        $periodosReservadosPorSecretaria = $this->periodosReservadosPorSecretaria(
            $data,
            $secretarias->pluck('id'),
            $excluirReservaId
        );

        return $this->anexarDisponibilidadePorPeriodo(
            $secretarias,
            $periodos,
            $periodosReservadosPorSecretaria
        );
    }

    /**
     * Verifica se já existe reserva ativa de $coluna=$valor (secretaria_id
     * ou user_id) que se sobreponha ao intervalo [$dataInicio, $dataFim],
     * num dos períodos em conflito. Usado por reservas de vários dias.
     *
     * O OR representa reservas novas (usam data_fim) vs. antigas (usam
     * apenas data).
     */
    public function existeReservaAtivaNoIntervalo(
        string $coluna,
        int $valor,
        array $periodosConflito,
        string $dataInicio,
        string $dataFim,
        ?int $excluirReservaId = null
    ): bool {
        return Reserva::where($coluna, $valor)
            ->whereIn('periodo_id', $periodosConflito)
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $dataFim)
            ->where(function ($query) use ($dataInicio) {
                $query
                    ->whereDate('data_fim', '>=', $dataInicio)
                    ->orWhere(function ($queryAntiga) use ($dataInicio) {
                        $queryAntiga
                            ->whereNull('data_fim')
                            ->whereDate('data', '>=', $dataInicio);
                    });
            })
            ->when(
                $excluirReservaId !== null,
                fn($query) => $query->where('id', '!=', $excluirReservaId)
            )
            ->exists();
    }

    /**
     * Verifica se já existe reserva ativa de $coluna=$valor numa única
     * $data, num dos períodos em conflito.
     */
    public function existeReservaAtivaNaData(
        string $coluna,
        int $valor,
        array $periodosConflito,
        string $data,
        ?int $excluirReservaId = null
    ): bool {
        return $this->reservasQueOcupam($data)
            ->where($coluna, $valor)
            ->whereIn('periodo_id', $periodosConflito)
            ->when(
                $excluirReservaId !== null,
                fn($query) => $query->where('id', '!=', $excluirReservaId)
            )
            ->exists();
    }

    /**
     * Verifica se uma QueryException é mesmo uma violação dos índices
     * únicos de reservas ativas (unique_reserva_secretaria_periodo_ativa
     * / unique_reserva_utilizador_periodo_ativo) — usado por todos os
     * pontos que criam ou atualizam reservas (web, API, Admin) para
     * traduzir só esse conflito específico numa mensagem amigável,
     * sem mascarar outros erros de base de dados como se fossem
     * sempre "lugar já reservado".
     *
     * O código de erro 1062 é específico do MySQL — o SQLite (usado
     * nos testes) nunca o produz, por isso a verificação é feita pelo
     * conteúdo da mensagem: o MySQL nomeia a constraint, o SQLite só
     * lista as colunas envolvidas.
     */
    public function ehConflitoDeReservaAtiva(QueryException $e): bool
    {
        $mensagem = $e->getMessage();

        return str_contains($mensagem, 'unique_reserva_secretaria_periodo_ativa')
            || str_contains($mensagem, 'unique_reserva_utilizador_periodo_ativo')
            || str_contains($mensagem, 'secretaria_id_ativa')
            || str_contains($mensagem, 'user_id_ativo')
            || str_contains($mensagem, 'unique_reserva_dia_secretaria_slot')
            || str_contains($mensagem, 'unique_reserva_dia_utilizador_slot')
            // SQLite não nomeia a constraint na mensagem de erro, só
            // lista as colunas envolvidas como "tabela.coluna" — ao
            // contrário de "reservas", "reserva_dias" não tem sufixo
            // "_ativa"/"_ativo" nas suas colunas, por isso precisa do
            // próprio par tabela.coluna como sinal.
            || str_contains($mensagem, 'reserva_dias.secretaria_id')
            || str_contains($mensagem, 'reserva_dias.user_id');
    }

    /**
     * Slots atómicos (manhã/tarde) que um período ocupa por dia — "Dia
     * inteiro" ocupa os dois, os restantes só o seu próprio. Mesmo
     * critério usado no backfill da migration de reserva_dias — mantido
     * separado de propósito, para essa migration nunca depender de
     * código da aplicação que pode mudar no futuro.
     */
    public function slotsDoPeriodo(string $nomePeriodo): array
    {
        return match ($nomePeriodo) {
            'Manhã' => ['manha'],
            'Tarde' => ['tarde'],
            'Dia inteiro' => ['manha', 'tarde'],
            default => ['manha', 'tarde'],
        };
    }

    /**
     * Uma linha ['dia' => ..., 'slot' => ...] por cada dia do calendário
     * entre $dataInicio e $dataFim (inclusive), para cada slot ocupado
     * pelo período — usado para popular reserva_dias. Inclui fins de
     * semana dentro do intervalo, de propósito: a disponibilidade
     * mostrada ao utilizador já os trata como ocupados (ver
     * reservasQueOcupam()), e esta tabela não pode discordar disso.
     */
    public function gerarDiasOcupados(
        string $dataInicio,
        string $dataFim,
        string $nomePeriodo
    ): array {
        $slots = $this->slotsDoPeriodo($nomePeriodo);

        $linhas = [];
        $dia = \Carbon\Carbon::parse($dataInicio);
        $fim = \Carbon\Carbon::parse($dataFim);

        while ($dia->lte($fim)) {
            foreach ($slots as $slot) {
                $linhas[] = [
                    'dia' => $dia->toDateString(),
                    'slot' => $slot,
                ];
            }

            $dia->addDay();
        }

        return $linhas;
    }

    /**
     * Reservas que ocupam um lugar em $data.
     *
     * Uma reserva de vários dias é uma única linha, com data no primeiro
     * dia e data_fim no último, por isso não basta procurar por
     * whereDate('data', $data): isso deixava um lugar reservado à semana
     * aparecer livre de terça a sexta. As reservas antigas não têm
     * data_fim e valem apenas para o próprio dia.
     *
     * "Ocupar" é definido por cancelada_at ser NULL, que é exatamente o
     * critério das colunas virtuais do índice único em reservas — assim a
     * disponibilidade mostrada nunca contradiz o que a base de dados
     * aceita gravar.
     */
    private function reservasQueOcupam(string $data)
    {
        return Reserva::query()
            ->whereNull('cancelada_at')
            ->noIntervalo($data);
    }

    /**
     * Devolve os IDs dos períodos incompatíveis com o período escolhido.
     */
    public function periodosEmConflito(int $periodoId): array
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
            ->map(fn($id) => (int) $id)
            ->all();
    }

    /**
     * Secretárias reserváveis e ativas, filtradas pelas características
     * marcadas em $preferencias (uma coluna booleana por característica
     * em CARACTERISTICAS_FILTRAVEIS).
     *
     * $setorId e $pisoId são ambos opcionais e independentes: com os
     * dois omitidos devolve lugares de todo o edifício; com só o piso
     * indicado, todas as categorias desse piso; com só a categoria,
     * esse setor em qualquer piso (não deve acontecer na prática, mas
     * a query continua correta).
     */
    private function secretariasFiltradasPorPreferencias(
        int|string|null $setorId,
        int|string|null $pisoId,
        array $preferencias
    ) {
        $query = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->with('setor.piso.edificio')
            ->when(
                $setorId !== null,
                fn($q) => $q->where('setor_id', $setorId)
            )
            ->when(
                $pisoId !== null,
                fn($q) => $q->whereHas(
                    'setor',
                    fn($setorQuery) => $setorQuery->where('piso_id', $pisoId)
                )
            );

        foreach (self::CARACTERISTICAS_FILTRAVEIS as $caracteristica) {
            $query->when(
                $preferencias[$caracteristica] ?? false,
                fn($q) => $q->where($caracteristica, true)
            );
        }

        return $query->orderBy('codigo')->get();
    }

    /**
     * Períodos já reservados (ativos) em $data para as secretárias
     * indicadas, agrupados por secretaria_id.
     */
    private function periodosReservadosPorSecretaria(
        string $data,
        Collection $secretariaIds,
        ?int $excluirReservaId
    ) {
        return $this->reservasQueOcupam($data)
            ->whereIn('secretaria_id', $secretariaIds)
            ->when(
                $excluirReservaId !== null,
                fn($query) => $query->where('id', '!=', $excluirReservaId)
            )
            ->get()
            ->groupBy('secretaria_id')
            ->map(fn($reservas) => $reservas->pluck('periodo_id'));
    }

    /**
     * Anexa a cada secretária o mapa periodo_id => disponível (bool),
     * considerando os períodos em conflito com cada período reservado.
     */
    private function anexarDisponibilidadePorPeriodo(
        Collection $secretarias,
        Collection $periodos,
        Collection $periodosReservadosPorSecretaria
    ) {
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
}
