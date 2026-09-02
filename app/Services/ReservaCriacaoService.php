<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Notifications\ReservaCriadaNotification;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Regras de criação de reservas (meio dia e dia inteiro).
 *
 * Extraído do ReservaController: as verificações de conflito, o cálculo
 * do intervalo em dias corridos e a criação reserva + pagamento eram
 * duplicadas entre store() e storeDiaInteiro().
 *
 * As violações de regra são lançadas como ValidationException — o mesmo
 * que o PagamentoService já faz — para o Inertia as apresentar nos
 * campos do formulário.
 */
class ReservaCriacaoService
{
    /**
     * Descrição legível de cada duração, usada na mensagem de sucesso.
     */
    private const DESCRICAO_DURACAO = [
        'diaria' => 'dia inteiro',
        'semanal' => '7 dias consecutivos',
        'mensal' => '1 mês de acesso contínuo',
        'anual' => '1 ano de acesso contínuo',
    ];

    public function __construct(
        private ReservaDisponibilidadeService $disponibilidade,
        private PagamentoService $pagamentos,
        private GoogleCalendarService $googleCalendar,
    ) {}

    /**
     * Cria uma reserva de meio dia (Manhã ou Tarde).
     *
     * @param  array{data:string,periodo_id:mixed,secretaria_id:mixed,observacoes?:?string}  $dados
     */
    public function criarMeioDia(array $dados, int $userId): Reserva
    {
        $periodo = Periodo::findOrFail($dados['periodo_id']);

        if ($periodo->nome === 'Dia inteiro') {
            throw ValidationException::withMessages([
                'periodo_id' => 'As reservas de dia inteiro devem ser efetuadas através da opção Dia inteiro.',
            ]);
        }

        $dataInicio = Carbon::parse($dados['data'])->toDateString();
        $dataFim = $this->calcularDataFim($dataInicio, 'diaria');

        $this->garantirSemConflitos(
            (int) $dados['secretaria_id'],
            $userId,
            (int) $periodo->id,
            $dataInicio,
            $dataFim,
            'Esta secretária já se encontra reservada para a data e período selecionados.',
            'Já possui uma reserva incompatível com este período na data selecionada.'
        );

        return $this->persistir([
            'user_id' => $userId,
            'secretaria_id' => $dados['secretaria_id'],
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->obterEstadoPendenteId(),
            'data' => $dataInicio,
            'data_fim' => $dataFim,
            'tipo_duracao' => 'diaria',
            'observacoes' => $dados['observacoes'] ?? null,
        ], $periodo->nome);
    }

    /**
     * Cria uma reserva de dia inteiro, numa única linha com o período
     * "Dia inteiro".
     *
     * Durações permitidas: diária (1 dia), semanal (7 dias corridos),
     * mensal (1 mês corrido) e anual (1 ano corrido) — todas incluem
     * sábados, domingos e feriados.
     *
     * @param  array{data:string,secretaria_id:mixed,tipo_duracao:string,observacoes?:?string}  $dados
     */
    public function criarDiaInteiro(array $dados, int $userId): Reserva
    {
        $tipoDuracao = $dados['tipo_duracao'];
        $dataInicial = Carbon::parse($dados['data']);

        $dataInicio = $dataInicial->toDateString();
        $dataFim = $this->calcularDataFim($dataInicio, $tipoDuracao);

        $periodoDiaInteiro = $this->obterPeriodoDiaInteiro();

        $this->garantirSemConflitos(
            (int) $dados['secretaria_id'],
            $userId,
            (int) $periodoDiaInteiro->id,
            $dataInicio,
            $dataFim,
            'Esta secretária já possui uma reserva em pelo menos um dos dias selecionados.',
            'Já possui outra reserva incompatível em pelo menos um dos dias selecionados.'
        );

        return $this->persistir([
            'user_id' => $userId,
            'secretaria_id' => $dados['secretaria_id'],
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $this->obterEstadoPendenteId(),
            'data' => $dataInicio,
            'data_fim' => $dataFim,
            'tipo_duracao' => $tipoDuracao,
            'observacoes' => $dados['observacoes'] ?? null,
        ], $periodoDiaInteiro->nome);
    }

    /**
     * Descrição legível da duração, para a mensagem de sucesso.
     */
    public function descricaoDuracao(string $tipoDuracao): string
    {
        return self::DESCRICAO_DURACAO[$tipoDuracao] ?? 'dia inteiro';
    }

    /**
     * Garante que nem a secretária nem o utilizador têm outra reserva
     * ativa em conflito no intervalo pedido.
     */
    private function garantirSemConflitos(
        int $secretariaId,
        int $userId,
        int $periodoId,
        string $dataInicio,
        string $dataFim,
        string $mensagemSecretaria,
        string $mensagemUtilizador
    ): void {
        $periodosConflito = $this->disponibilidade->periodosEmConflito($periodoId);

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'secretaria_id',
            $secretariaId,
            $periodosConflito,
            $dataInicio,
            $dataFim
        )) {
            throw ValidationException::withMessages([
                'secretaria_id' => $mensagemSecretaria,
            ]);
        }

        if ($this->disponibilidade->existeReservaAtivaNoIntervalo(
            'user_id',
            $userId,
            $periodosConflito,
            $dataInicio,
            $dataFim
        )) {
            throw ValidationException::withMessages([
                'data' => $mensagemUtilizador,
            ]);
        }
    }

    /**
     * Cria a reserva e o respetivo pagamento numa transação, e notifica
     * o utilizador.
     *
     * A notificação corre depois da transação fechar, de propósito: se
     * corresse lá dentro e falhasse, a exceção subiria e o Laravel
     * reverteria a reserva e o pagamento já válidos só por causa de um
     * problema no envio da notificação — perder o aviso é aceitável,
     * perder a reserva não.
     *
     * Uma violação dos índices únicos de reservas ativas (corrida entre
     * pedidos em simultâneo) é traduzida numa mensagem amigável;
     * qualquer outro erro de base de dados é relançado, para não
     * mascarar problemas reais — por exemplo, uma eventual colisão na
     * referência do pagamento (extremamente improvável, mas não
     * impossível) não deve ser apresentada como "lugar já reservado".
     *
     * As linhas de reserva_dias (uma por dia+slot ocupado) são
     * inseridas na mesma transação: é essa constraint, não a de
     * reservas, que apanha colisões entre reservas com datas de início
     * diferentes mas intervalos sobrepostos (ver
     * 2026_08_04_010000_create_reserva_dias_table).
     */
    private function persistir(array $dadosReserva, string $nomePeriodo): Reserva
    {
        try {
            $reserva = DB::transaction(function () use ($dadosReserva, $nomePeriodo) {
                $reserva = Reserva::create($dadosReserva);

                $this->pagamentos->criarParaReserva($reserva);

                $diasOcupados = $this->disponibilidade->gerarDiasOcupados(
                    $dadosReserva['data'],
                    $dadosReserva['data_fim'],
                    $nomePeriodo
                );

                ReservaDia::insert(array_map(
                    fn (array $dia) => [
                        'reserva_id' => $reserva->id,
                        'secretaria_id' => $reserva->secretaria_id,
                        'user_id' => $reserva->user_id,
                        'dia' => $dia['dia'],
                        'slot' => $dia['slot'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $diasOcupados
                ));

                return $reserva;
            });
        } catch (QueryException $e) {
            if (! $this->disponibilidade->ehConflitoDeReservaAtiva($e)) {
                throw $e;
            }

            throw ValidationException::withMessages([
                'secretaria_id' => 'Este lugar acabou de ser reservado por outra pessoa. Escolhe outro período ou lugar.',
            ]);
        }

        $reserva->user?->notify(
            new ReservaCriadaNotification(
                $reserva->load(['secretaria', 'periodo'])
            )
        );

        $this->googleCalendar->sincronizarReserva($reserva);

        return $reserva;
    }

    /**
     * Período "Dia inteiro", com mensagens compreensíveis (em vez de
     * 404) caso não exista ou esteja inativo.
     */
    private function obterPeriodoDiaInteiro(): Periodo
    {
        $periodo = Periodo::where('nome', 'Dia inteiro')->first();

        if ($periodo === null) {
            throw ValidationException::withMessages([
                'tipo_duracao' => 'O período Dia inteiro não está configurado no sistema.',
            ]);
        }

        if (! $periodo->ativo) {
            throw ValidationException::withMessages([
                'tipo_duracao' => 'O período Dia inteiro encontra-se inativo.',
            ]);
        }

        return $periodo;
    }

    /**
     * ID do estado "pendente", com mensagem compreensível (em vez de 404)
     * caso não esteja configurado.
     */
    private function obterEstadoPendenteId(): int
    {
        $estadoId = EstadoReserva::idPorCodigo('pendente');

        if ($estadoId === null) {
            throw ValidationException::withMessages([
                'reserva' => 'O estado pendente não está configurado no sistema.',
            ]);
        }

        return $estadoId;
    }

    /**
     * Data final do intervalo, em dias corridos — inclui sábados,
     * domingos e feriados, sem os saltar nem os adicionar à parte.
     *
     * Semanal soma 7 dias corridos ao todo (data de início inclusive).
     * Mensal e anual somam um mês/ano de calendário e depois subtraem
     * um dia, para lidar corretamente com mudança de mês, mudança de
     * ano, fevereiro e anos bissextos (ex.: início a 31 de janeiro não
     * avança para março — addMonthNoOverflow fixa-se no último dia de
     * fevereiro).
     */
    private function calcularDataFim(
        string $dataInicio,
        string $tipoDuracao
    ): string {
        $dataFim = Carbon::parse($dataInicio);

        return match ($tipoDuracao) {
            'semanal' => $dataFim->addDays(6)->toDateString(),
            'mensal' => $dataFim->addMonthNoOverflow()->subDay()->toDateString(),
            'anual' => $dataFim->addYearNoOverflow()->subDay()->toDateString(),
            default => $dataFim->toDateString(),
        };
    }
}
