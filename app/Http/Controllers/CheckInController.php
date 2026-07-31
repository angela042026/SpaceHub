<?php

namespace App\Http\Controllers;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Services\DashboardMetricsService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    /**
     * Página com leitura de câmara para ler o QR Code de uma secretária.
     */
    public function camera(): Response
    {
        return Inertia::render('CheckIn/Camera');
    }

    /**
     * Página aberta ao ler o QR Code de uma secretária (ou ao visitar o link diretamente).
     */
    public function scan(string $qrToken): Response
    {
        $secretaria = Secretaria::with('setor.piso.edificio')
            ->where('qr_token', $qrToken)
            ->firstOrFail();

        $hoje = Carbon::today();

        $reserva = Reserva::with(['periodo', 'estadoReserva'])
            ->where('secretaria_id', $secretaria->id)
            ->where('user_id', auth()->id())
            ->whereDate('data', $hoje)
            ->whereHas('estadoReserva', fn ($q) => $q->whereIn('codigo', EstadoReserva::codigosAtivos()))
            ->first();

        if (! $reserva) {
            $ocupadaPorOutro = Reserva::where('secretaria_id', $secretaria->id)
                ->whereDate('data', $hoje)
                ->whereHas('estadoReserva', fn ($q) => $q->whereIn('codigo', EstadoReserva::codigosAtivos()))
                ->exists();

            return Inertia::render('CheckIn/Scan', [
                'secretaria' => $secretaria,
                'reserva' => null,
                'status' => ($secretaria->ativo && $secretaria->reservavel)
                    ? ($ocupadaPorOutro ? 'ocupada_por_outro' : 'sem_reserva')
                    : 'indisponivel',
            ]);
        }

        return Inertia::render('CheckIn/Scan', [
            'secretaria' => $secretaria,
            'reserva' => $reserva,
            'status' => $this->statusDaReserva($reserva),
        ]);
    }

    /**
     * Confirma o check-in de uma reserva (via scan de QR Code ou botão manual no dashboard).
     */
    public function confirm(Reserva $reserva): RedirectResponse
    {
        Gate::authorize('gerirPropria', $reserva);

        $reserva->load(['periodo', 'estadoReserva']);

        $status = $this->statusDaReserva($reserva);

        if ($status === 'ja_check_in') {
            return back()->withErrors(['reserva' => 'Já fizeste check-in nesta reserva.']);
        }

        if ($status === 'fora_da_janela') {
            return back()->withErrors(['reserva' => 'Fora da janela horária permitida para check-in.']);
        }

        if (! in_array($reserva->estadoReserva?->codigo, EstadoReserva::codigosAtivos(), true)) {
            return back()->withErrors(['reserva' => 'Esta reserva já não está ativa.']);
        }

        $idEstadoConfirmada = EstadoReserva::idPorCodigo('confirmada');

        $reserva->update([
            'check_in_at' => now(),
            'estado_reserva_id' => $idEstadoConfirmada ?? $reserva->estado_reserva_id,
        ]);

        broadcast(new MapaAtualizado());
        DashboardMetricsService::limparCacheDoDia();

        return back()->with('success', 'Check-in confirmado com sucesso.');
    }

    /**
     * Calcula o estado do fluxo de check-in para uma reserva: já feito, fora da janela
     * horária, ou pronta a confirmar.
     */
    private function statusDaReserva(Reserva $reserva): string
    {
        if ($reserva->check_in_at !== null) {
            return 'ja_check_in';
        }

        if (! $reserva->periodo) {
            return 'pronta';
        }

        $data = $reserva->data->format('Y-m-d');

        $abreJanela = Carbon::parse("{$data} {$reserva->periodo->hora_inicio->format('H:i')}")
            ->subMinutes(config('reservas.tolerancia_checkin_minutos'));
        $fechaJanela = Carbon::parse("{$data} {$reserva->periodo->hora_fim->format('H:i')}");

        if (! now()->between($abreJanela, $fechaJanela)) {
            return 'fora_da_janela';
        }

        return 'pronta';
    }
}
