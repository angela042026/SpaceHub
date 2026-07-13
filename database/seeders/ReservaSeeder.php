<?php

namespace Database\Seeders;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'utilizador@spacehub.pt')->first();
        $admin = User::where('email', 'admin@spacehub.pt')->first();

        $manha = Periodo::where('nome', 'Manhã')->first();
        $tarde = Periodo::where('nome', 'Tarde')->first();

        $pendente = EstadoReserva::where('codigo', 'pendente')->first();
        $confirmada = EstadoReserva::where('codigo', 'confirmada')->first();
        $cancelada = EstadoReserva::where('codigo', 'cancelada')->first();

        $secretarias = Secretaria::take(6)->get();

        if (!$user || !$admin || !$manha || !$tarde || !$pendente || !$confirmada || $secretarias->count() < 3) {
            return;
        }

        Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[0]->id,
                'data' => Carbon::today(),
                'periodo_id' => $manha->id,
            ],
            [
                'user_id' => $user->id,
                'estado_reserva_id' => $confirmada->id,
                'check_in_at' => now(),
            ]
        );

        Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[1]->id,
                'data' => Carbon::today(),
                'periodo_id' => $tarde->id,
            ],
            [
                'user_id' => $admin->id,
                'estado_reserva_id' => $pendente->id,
            ]
        );

        Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[2]->id,
                'data' => Carbon::tomorrow(),
                'periodo_id' => $manha->id,
            ],
            [
                'user_id' => $user->id,
                'estado_reserva_id' => $pendente->id,
            ]
        );
        Reserva::updateOrCreate(
            [
                'secretaria_id' => $secretarias[3]->id,
                'data' => Carbon::today(),
                'periodo_id' => $tarde->id,
            ],
            [
                'user_id' => $user->id,
                'estado_reserva_id' => $cancelada->id,
            ]
        );
    }
}
