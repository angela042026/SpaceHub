<?php

namespace Database\Seeders;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\User;
use App\Services\PagamentoService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use RuntimeException;

class ReservaSeeder extends Seeder
{
    public function run(PagamentoService $pagamentoService): void
    {
        // As reservas de exemplo pertencem às contas de demonstração
        // que UserSeeder só cria em local/testing (ver o mesmo gate
        // lá) — sem isto, `migrate --seed` num ambiente com APP_ENV
        // diferente falhava a meio com RuntimeException, depois de já
        // ter criado roles/períodos/estados/estrutura física.
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $utilizador = User::where('email', 'utilizador@spacehub.pt')->first();
        $admin = User::where('email', 'admin@spacehub.pt')->first();

        $manha = Periodo::where('nome', 'Manhã')->first();
        $tarde = Periodo::where('nome', 'Tarde')->first();

        $confirmada = EstadoReserva::where('codigo', 'confirmada')->first();
        $pendente = EstadoReserva::where('codigo', 'pendente')->first();
        $cancelada = EstadoReserva::where('codigo', 'cancelada')->first();
        $expirada = EstadoReserva::where('codigo', 'expirada')->first();

        $secretarias = Secretaria::query()
            ->orderBy('id')
            ->take(5)
            ->get();

        if (! $utilizador || ! $admin) {
            throw new RuntimeException(
                'ReservaSeeder: os utilizadores obrigatórios não foram encontrados.'
            );
        }

        if (! $manha || ! $tarde) {
            throw new RuntimeException(
                'ReservaSeeder: os períodos obrigatórios não foram encontrados.'
            );
        }

        if (! $confirmada || ! $pendente || ! $cancelada || ! $expirada) {
            throw new RuntimeException(
                'ReservaSeeder: os estados de reserva obrigatórios não foram encontrados.'
            );
        }

        if ($secretarias->count() < 5) {
            throw new RuntimeException(
                'ReservaSeeder: são necessárias pelo menos cinco secretárias.'
            );
        }

        $reserva1 = Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[0]->id,
                'data' => Carbon::today()->toDateString(),
                'periodo_id' => $manha->id,
            ],
            [
                'user_id' => $utilizador->id,
                'estado_reserva_id' => $confirmada->id,
                'check_in_at' => now()->subMinutes(20),
            ]
        );

        $pagamentoService->criarParaReserva($reserva1);

        $reserva2 = Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[1]->id,
                'data' => Carbon::today()->toDateString(),
                'periodo_id' => $manha->id,
            ],
            [
                'user_id' => $admin->id,
                'estado_reserva_id' => $pendente->id,
                'check_in_at' => null,
            ]
        );

        $pagamentoService->criarParaReserva($reserva2);

        $reserva3 = Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[2]->id,
                'data' => Carbon::today()->toDateString(),
                'periodo_id' => $tarde->id,
            ],
            [
                'user_id' => $utilizador->id,
                'estado_reserva_id' => $cancelada->id,
                'check_in_at' => null,
            ]
        );

        $pagamento3 = $pagamentoService->criarParaReserva($reserva3);
        $pagamentoService->cancelarParaReserva($reserva3);

        $reserva4 = Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[3]->id,
                'data' => Carbon::today()->toDateString(),
                'periodo_id' => $tarde->id,
            ],
            [
                'user_id' => $admin->id,
                'estado_reserva_id' => $expirada->id,
                'check_in_at' => null,

                /*
                 * O comando reservas:cancelar-expiradas grava sempre
                 * cancelada_at junto com o estado. Sem isto, a reserva
                 * semeada continuava a ocupar o lugar — o índice único
                 * e as consultas de disponibilidade usam cancelada_at,
                 * não o estado.
                 */
                'cancelada_at' => now(),
            ]
        );

        $pagamentoService->criarParaReserva($reserva4);
        $pagamentoService->cancelarParaReserva($reserva4);

        $reserva5 = Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[4]->id,
                'data' => Carbon::tomorrow()->toDateString(),
                'periodo_id' => $manha->id,
            ],
            [
                'user_id' => $utilizador->id,
                'estado_reserva_id' => $pendente->id,
                'check_in_at' => null,
            ]
        );

        $pagamentoService->criarParaReserva($reserva5);
    }
}
