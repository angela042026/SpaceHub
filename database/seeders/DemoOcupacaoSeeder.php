<?php

namespace Database\Seeders;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;
use App\Services\PagamentoService;
use App\Services\ReservaCriacaoService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Validation\ValidationException;

/**
 * Popula reservas realistas (passadas, de hoje e futuras, com check-ins e
 * cancelamentos) só para dar vida ao dashboard e ao mapa em ambiente local.
 *
 * Não corre dentro do DatabaseSeeder por omissão — é opt-in, correr à parte:
 *   php artisan db:seed --class=DemoOcupacaoSeeder
 *
 * Usa sempre o ReservaCriacaoService para criar cada reserva, para que as
 * linhas de reserva_dias fiquem corretas e a disponibilidade não fique
 * dessincronizada (ver 2026_08_04_010000_create_reserva_dias_table). O
 * estado final (confirmada/cancelada/expirada/check-in) é aplicado depois,
 * tal como o ReservaSeeder já fazia para os 5 registos originais.
 */
class DemoOcupacaoSeeder extends Seeder
{
    private const TOTAL_UTILIZADORES_DEMO = 20;

    private const SLOTS = [
        'manha' => ['08:00', '13:00'],
        'tarde' => ['13:00', '18:00'],
    ];

    public function run(
        ReservaCriacaoService $criacao,
        PagamentoService $pagamentos
    ): void {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $utilizadores = $this->obterOuCriarUtilizadores();

        $periodos = [
            'manha' => Periodo::where('nome', 'Manhã')->firstOrFail(),
            'tarde' => Periodo::where('nome', 'Tarde')->firstOrFail(),
        ];

        $estados = [
            'confirmada' => EstadoReserva::idPorCodigo('confirmada'),
            'cancelada' => EstadoReserva::idPorCodigo('cancelada'),
            'expirada' => EstadoReserva::idPorCodigo('expirada'),
        ];

        $secretarias = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->get();

        if ($secretarias->isEmpty() || $utilizadores->isEmpty()) {
            return;
        }

        // -65 (não só -10) para também cobrir o período "anterior" de 30
        // dias que os gráficos de comparação do dashboard mostram — sem
        // isto, "Reservas por piso" e a linha "Semana anterior" ficavam
        // sempre a zero fora do período recente.
        for ($offset = -65; $offset <= 4; $offset++) {
            $dia = Carbon::today()->addDays($offset);

            $this->popularDia(
                $dia,
                $utilizadores,
                $secretarias,
                $periodos,
                $estados,
                $criacao,
                $pagamentos
            );
        }

        /*
         * A distribuição de desfechos em popularDia() é probabilística e
         * só considera "expirada" para reservas de hoje cujo período já
         * passou a janela de tolerância — em dias de pouca atividade
         * (fim de semana) ou logo a seguir ao início de um período, isso
         * pode dar sempre zero por puro azar. Para o card "Reservas
         * Expiradas" nunca ficar preso a zero num dia normal de teste,
         * força aqui um mínimo de candidatas elegíveis (reserva de hoje,
         * sem check-in, cujo período já passou a tolerância).
         */
        if ($estados['expirada'] !== null) {
            $this->garantirMinimoExpiradasHoje(
                $pagamentos,
                $criacao,
                $estados['expirada'],
                $periodos,
                $utilizadores,
                $secretarias
            );
        }

        /*
         * Uma secretária só aparece "ocupada" no dashboard se o período
         * estiver mesmo a decorrer agora E a reserva tiver check-in feito
         * (ver MapaOcupacaoService::estadoSecretaria()). Como
         * escolherDesfecho() só atribui "confirmada_checkin" quando o
         * seeder corre dentro da janela de tolerância à volta do início
         * de um período, correr o seeder fora dessa janela deixava
         * "Ocupadas" preso a zero até o fim dos tempos, independentemente
         * da hora a que o dashboard fosse depois visto. Garante aqui um
         * mínimo de check-ins ativos para os períodos que estão mesmo a
         * decorrer neste momento.
         */
        $this->garantirMinimoOcupadasHoje(
            $periodos,
            $criacao,
            $utilizadores,
            $secretarias
        );
    }

    /**
     * Garante um mínimo de reservas "expiradas" hoje, para o card do
     * dashboard nunca ficar preso a zero por puro azar da distribuição
     * probabilística em popularDia().
     *
     * Primeiro tenta reaproveitar reservas "pendentes" que já tenham
     * sobrado da distribuição normal; se não houver que cheguem, cria
     * reservas novas dedicadas só para isto. Só o faz para períodos cuja
     * janela de tolerância já passou hoje — antes disso não há nada que
     * possa legitimamente ter expirado.
     */
    private function garantirMinimoExpiradasHoje(
        PagamentoService $pagamentos,
        ReservaCriacaoService $criacao,
        int $estadoExpiradaId,
        array $periodos,
        $utilizadores,
        $secretarias,
        int $minimo = 2
    ): void {
        $hoje = Carbon::today();
        $tolerancia = (int) config('reservas.tolerancia_checkin_minutos', 30);

        /*
         * Tal como o comando real (CancelarReservasExpiradas), só uma
         * reserva "pendente" pode expirar — uma "confirmada" já tem o
         * pagamento marcado como pago, e cancelarParaReserva() recusa
         * cancelar um pagamento pago (reembolso ainda não implementado).
         */
        $estadoPendenteId = EstadoReserva::idPorCodigo('pendente');

        $candidatas = Reserva::query()
            ->whereDate('data', $hoje)
            ->whereNull('cancelada_at')
            ->whereNull('check_in_at')
            ->where('estado_reserva_id', $estadoPendenteId)
            ->whereHas(
                'user',
                fn ($query) => $query->where(
                    'email',
                    'like',
                    'colaborador.demo%@spacehub.pt'
                )
            )
            ->with('periodo')
            ->get()
            ->filter(function (Reserva $reserva) use ($hoje, $tolerancia) {
                if (! $reserva->periodo || $reserva->periodo->nome === 'Dia inteiro') {
                    return false;
                }

                $limite = Carbon::parse(
                    $hoje->toDateString()
                    .' '
                    .$reserva->periodo->hora_inicio->format('H:i')
                )->addMinutes($tolerancia);

                return now()->greaterThanOrEqualTo($limite);
            })
            ->shuffle();

        $expiradas = 0;

        foreach ($candidatas as $reserva) {
            if ($expiradas >= $minimo) {
                break;
            }

            try {
                $this->cancelar($reserva, $pagamentos, $estadoExpiradaId, $hoje);
                $expiradas++;
            } catch (ValidationException) {
                continue;
            }
        }

        if ($expiradas >= $minimo) {
            return;
        }

        // Períodos cuja janela de tolerância já passou hoje — só esses
        // podem legitimamente ter uma reserva "expirada".
        $periodosElegiveis = collect($periodos)->filter(
            function ($periodo, $slot) use ($hoje, $tolerancia) {
                [$horaInicio] = self::SLOTS[$slot];

                $limite = $hoje->copy()
                    ->setTimeFromTimeString($horaInicio)
                    ->addMinutes($tolerancia);

                return now()->greaterThanOrEqualTo($limite);
            }
        );

        if ($periodosElegiveis->isEmpty()) {
            return;
        }

        $secretariasEmbaralhadas = $secretarias->shuffle()->values();

        foreach ($utilizadores->shuffle() as $utilizador) {
            if ($expiradas >= $minimo) {
                break;
            }

            foreach ($periodosElegiveis as $slot => $periodo) {
                if ($expiradas >= $minimo) {
                    break;
                }

                $secretaria = $secretariasEmbaralhadas->first(
                    fn ($candidata) => ! $this->slotOcupado(
                        $candidata->id,
                        $utilizador->id,
                        $hoje,
                        $slot
                    )
                );

                if (! $secretaria) {
                    continue;
                }

                try {
                    $reserva = $criacao->criarMeioDia([
                        'data' => $hoje->toDateString(),
                        'periodo_id' => $periodo->id,
                        'secretaria_id' => $secretaria->id,
                    ], $utilizador->id);
                } catch (ValidationException) {
                    continue;
                }

                $this->cancelar($reserva, $pagamentos, $estadoExpiradaId, $hoje);
                $expiradas++;
            }
        }
    }

    /**
     * Garante um mínimo de secretárias com check-in ativo neste preciso
     * momento, para o card "Estado atual" nunca ficar preso a
     * "Ocupadas: 0" só porque o seeder correu fora da janela de
     * tolerância à volta do início de um período.
     *
     * Só atua nos períodos (manhã/tarde) que estão mesmo a decorrer
     * agora — fora disso não haveria nada legitimamente "ocupado".
     * Primeiro reaproveita reservas de hoje sem check-in nesses
     * períodos; só cria reservas novas se não houver candidatas
     * suficientes.
     */
    private function garantirMinimoOcupadasHoje(
        array $periodos,
        ReservaCriacaoService $criacao,
        $utilizadores,
        $secretarias,
        int $minimo = 3
    ): void {
        $hoje = Carbon::today();

        $slotsAtivos = collect(self::SLOTS)->filter(
            function ($horarios, $slot) use ($hoje) {
                [$horaInicio, $horaFim] = $horarios;

                $inicio = $hoje->copy()->setTimeFromTimeString($horaInicio);
                $fim = $hoje->copy()->setTimeFromTimeString($horaFim);

                return now()->between($inicio, $fim);
            }
        );

        if ($slotsAtivos->isEmpty()) {
            return;
        }

        $periodoIdsAtivos = $slotsAtivos->keys()
            ->map(fn ($slot) => $periodos[$slot]->id)
            ->all();

        $slotPorPeriodoId = collect($periodos)->mapWithKeys(
            fn ($periodo, $slot) => [$periodo->id => $slot]
        );

        $candidatas = Reserva::query()
            ->whereDate('data', $hoje)
            ->whereNull('cancelada_at')
            ->whereNull('check_in_at')
            ->whereIn('periodo_id', $periodoIdsAtivos)
            ->whereHas(
                'user',
                fn ($query) => $query->where(
                    'email',
                    'like',
                    'colaborador.demo%@spacehub.pt'
                )
            )
            ->get()
            ->shuffle();

        $ocupadas = 0;

        foreach ($candidatas as $reserva) {
            if ($ocupadas >= $minimo) {
                break;
            }

            $slot = $slotPorPeriodoId[$reserva->periodo_id] ?? null;

            if ($slot === null) {
                continue;
            }

            $this->confirmar($reserva, true, $hoje, $slot);
            $ocupadas++;
        }

        if ($ocupadas >= $minimo) {
            return;
        }

        $secretariasEmbaralhadas = $secretarias->shuffle()->values();

        foreach ($utilizadores->shuffle() as $utilizador) {
            if ($ocupadas >= $minimo) {
                break;
            }

            foreach ($slotsAtivos as $slot => $horarios) {
                if ($ocupadas >= $minimo) {
                    break;
                }

                $secretaria = $secretariasEmbaralhadas->first(
                    fn ($candidata) => ! $this->slotOcupado(
                        $candidata->id,
                        $utilizador->id,
                        $hoje,
                        $slot
                    )
                );

                if (! $secretaria) {
                    continue;
                }

                try {
                    $reserva = $criacao->criarMeioDia([
                        'data' => $hoje->toDateString(),
                        'periodo_id' => $periodos[$slot]->id,
                        'secretaria_id' => $secretaria->id,
                    ], $utilizador->id);
                } catch (ValidationException) {
                    continue;
                }

                $this->confirmar($reserva, true, $hoje, $slot);
                $ocupadas++;
            }
        }
    }

    private function obterOuCriarUtilizadores()
    {
        $roleUtilizador = Role::where('nome', 'Utilizador')->first();

        if (! $roleUtilizador) {
            return collect();
        }

        for ($i = 1; $i <= self::TOTAL_UTILIZADORES_DEMO; $i++) {
            // pravatar.cc tem 70 fotos numeradas (1-70) — módulo garante
            // que nunca saímos do intervalo válido, mesmo se
            // TOTAL_UTILIZADORES_DEMO crescer.
            $numeroAvatar = (($i - 1) % 70) + 1;

            User::updateOrCreate(
                ['email' => "colaborador.demo{$i}@spacehub.pt"],
                [
                    'name' => "Colaborador Demo {$i}",
                    'password' => bcrypt('password123'),
                    'role_id' => $roleUtilizador->id,
                    'ativo' => true,
                    'fotografia' => "https://i.pravatar.cc/150?img={$numeroAvatar}",
                ]
            );
        }

        return User::where(
            'email',
            'like',
            'colaborador.demo%@spacehub.pt'
        )->get();
    }

    private function popularDia(
        Carbon $dia,
        $utilizadores,
        $secretarias,
        array $periodos,
        array $estados,
        ReservaCriacaoService $criacao,
        PagamentoService $pagamentos
    ): void {
        $fimDeSemana = $dia->isWeekend();

        $utilizadoresDoDia = $utilizadores
            ->shuffle()
            ->take(random_int(
                $fimDeSemana ? 3 : 10,
                $fimDeSemana ? 8 : min(20, $utilizadores->count())
            ));

        $secretariasDisponiveis = $secretarias->shuffle()->values();
        $indiceSecretaria = 0;

        foreach ($utilizadoresDoDia as $utilizador) {
            $slotsDoUtilizador = $this->escolherPonderado([
                'manha' => 35,
                'tarde' => 35,
                'ambos' => 30,
            ]);

            $slots = $slotsDoUtilizador === 'ambos'
                ? ['manha', 'tarde']
                : [$slotsDoUtilizador];

            foreach ($slots as $slot) {
                if ($indiceSecretaria >= $secretariasDisponiveis->count()) {
                    break 2;
                }

                $secretaria = $secretariasDisponiveis[$indiceSecretaria];
                $indiceSecretaria++;

                if ($this->slotOcupado($secretaria->id, $utilizador->id, $dia, $slot)) {
                    continue;
                }

                $this->reservarSlot(
                    $dia,
                    $slot,
                    $utilizador,
                    $secretaria,
                    $periodos,
                    $estados,
                    $criacao,
                    $pagamentos
                );
            }
        }
    }

    private function slotOcupado(
        int $secretariaId,
        int $userId,
        Carbon $dia,
        string $slot
    ): bool {
        return ReservaDia::where('dia', $dia->toDateString())
            ->where('slot', $slot)
            ->where(function ($query) use ($secretariaId, $userId) {
                $query
                    ->where('secretaria_id', $secretariaId)
                    ->orWhere('user_id', $userId);
            })
            ->exists();
    }

    private function reservarSlot(
        Carbon $dia,
        string $slot,
        User $utilizador,
        Secretaria $secretaria,
        array $periodos,
        array $estados,
        ReservaCriacaoService $criacao,
        PagamentoService $pagamentos
    ): void {
        try {
            $reserva = $criacao->criarMeioDia([
                'data' => $dia->toDateString(),
                'periodo_id' => $periodos[$slot]->id,
                'secretaria_id' => $secretaria->id,
            ], $utilizador->id);
        } catch (ValidationException) {
            return;
        }

        $desfecho = $this->escolherDesfecho($dia, $slot);

        match ($desfecho) {
            'pendente' => null,
            'confirmada' => $this->confirmar($reserva, false, $dia, $slot),
            'confirmada_checkin' => $this->confirmar($reserva, true, $dia, $slot),
            'cancelada' => $this->cancelar($reserva, $pagamentos, $estados['cancelada'], $dia),
            'expirada' => $this->cancelar($reserva, $pagamentos, $estados['expirada'], $dia),
        };
    }

    private function escolherDesfecho(Carbon $dia, string $slot): string
    {
        [$horaInicio, $horaFim] = self::SLOTS[$slot];

        $inicioSlot = $dia->copy()->setTimeFromTimeString($horaInicio);
        $fimSlot = $dia->copy()->setTimeFromTimeString($horaFim);
        $agora = now();

        if ($dia->isPast() && ! $dia->isToday()) {
            return $this->escolherPonderado([
                'confirmada_checkin' => 70,
                'cancelada' => 20,
                'expirada' => 10,
            ]);
        }

        if ($dia->isToday()) {
            /*
             * O check-in só é considerado em atraso (e a reserva passa a
             * "expirada") depois da janela de tolerância a contar do
             * início do período — não do fim. Usar o fim do período aqui
             * fazia com que "Reservas Expiradas" nunca subisse enquanto o
             * período ainda estivesse a decorrer.
             */
            $tolerancia = (int) config('reservas.tolerancia_checkin_minutos', 30);
            $inicioJanela = $inicioSlot->copy()->subMinutes($tolerancia);
            $fimJanela = $inicioSlot->copy()->addMinutes($tolerancia);

            if ($agora->lessThan($inicioJanela)) {
                return $this->escolherPonderado([
                    'confirmada' => 50,
                    'pendente' => 30,
                    'cancelada' => 20,
                ]);
            }

            if ($agora->between($inicioJanela, $fimJanela)) {
                return $this->escolherPonderado([
                    'confirmada_checkin' => 60,
                    'confirmada' => 20,
                    'cancelada' => 15,
                    'pendente' => 5,
                ]);
            }

            return $this->escolherPonderado([
                'confirmada_checkin' => 45,
                'expirada' => 35,
                'cancelada' => 20,
            ]);
        }

        return $this->escolherPonderado([
            'confirmada' => 45,
            'pendente' => 35,
            'cancelada' => 20,
        ]);
    }

    private function confirmar(
        Reserva $reserva,
        bool $checkin,
        Carbon $dia,
        string $slot
    ): void {
        $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');

        $dadosReserva = [
            'estado_reserva_id' => $estadoConfirmadaId,
        ];

        if ($checkin) {
            [$horaInicio] = self::SLOTS[$slot];

            $horaCheckin = $dia->copy()
                ->setTimeFromTimeString($horaInicio)
                ->addMinutes(random_int(0, 45));

            $dadosReserva['check_in_at'] = $horaCheckin->isFuture()
                ? now()
                : $horaCheckin;
        }

        $reserva->update($dadosReserva);

        $pagamento = $reserva->pagamento()->first();

        $pagamento?->update([
            'estado' => 'pago',
            'metodo_pagamento' => collect([
                'cartao', 'mbway', 'transferencia', 'paypal',
            ])->random(),
            'data_pagamento' => $reserva->created_at,
        ]);
    }

    private function cancelar(
        Reserva $reserva,
        PagamentoService $pagamentos,
        ?int $estadoId,
        Carbon $dia
    ): void {
        if ($estadoId === null) {
            return;
        }

        $pagamentos->cancelarParaReserva($reserva);

        $momento = $dia->isFuture() || $dia->isToday()
            ? now()
            : $dia->copy()->setTime(random_int(8, 17), random_int(0, 59));

        $reserva->update([
            'estado_reserva_id' => $estadoId,
            'cancelada_at' => $momento,
        ]);

        ReservaDia::where('reserva_id', $reserva->id)->delete();
    }

    private function escolherPonderado(array $pesos): string
    {
        $total = array_sum($pesos);
        $sorteio = random_int(1, $total);
        $acumulado = 0;

        foreach ($pesos as $chave => $peso) {
            $acumulado += $peso;

            if ($sorteio <= $acumulado) {
                return $chave;
            }
        }

        return array_key_first($pesos);
    }
}
