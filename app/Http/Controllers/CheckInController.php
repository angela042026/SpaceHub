<?php

namespace App\Http\Controllers;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Services\ActivityLogger;
use App\Services\DashboardMetricsService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    /**
     * Página com leitura de câmara para ler o QR Code de uma secretária.
     *
     * Mostra também, num resumo compacto, as reservas ainda elegíveis
     * para check-in hoje (sem check-in feito) — inclui reservas
     * semanais/mensais/anuais em qualquer dia do seu intervalo, não só
     * no primeiro. Pode haver mais do que uma, daí devolver sempre uma
     * coleção em vez de só a primeira.
     */
    public function camera(): Response
    {
        $reservas = Reserva::with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where('user_id', auth()->id())
            ->noIntervalo(Carbon::today())
            ->whereIn('estado_reserva_id', EstadoReserva::idsAtivos())
            ->whereNull('check_in_at')
            ->orderBy('periodo_id')
            ->get();

        return Inertia::render('CheckIn/Camera', [
            'reservas' => $reservas->map(fn (Reserva $reserva) => [
                ...$reserva->toArray(),
                'status' => $this->statusDaReserva($reserva),
            ]),
        ]);
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
            ->noIntervalo($hoje)
            ->whereHas('estadoReserva', fn ($q) => $q->whereIn('codigo', EstadoReserva::codigosAtivos()))
            ->first();

        if (! $reserva) {
            $ocupadaPorOutro = Reserva::where('secretaria_id', $secretaria->id)
                ->noIntervalo($hoje)
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
     * Confirma o check-in de uma reserva — via QR Code (obrigatório para
     * Utilizador/Colaborador) ou manualmente (só Administrador/Gestor,
     * sempre registado como tal no Registo de Atividade).
     */
    public function confirm(Request $request, Reserva $reserva): RedirectResponse
    {
        Gate::authorize('gerirPropria', $reserva);

        $reserva->load(['periodo', 'estadoReserva', 'secretaria']);

        if (! in_array($reserva->estadoReserva?->codigo, EstadoReserva::codigosAtivos(), true)) {
            return back()->withErrors(['reserva' => __('Esta reserva já não está ativa.')]);
        }

        $status = $this->statusDaReserva($reserva);

        if ($status === 'ja_check_in') {
            return back()->withErrors(['reserva' => __('Já fizeste check-in nesta reserva.')]);
        }

        if ($status === 'pendente_pagamento') {
            return back()->withErrors(['reserva' => __('Esta reserva está pendente de pagamento. Conclui o pagamento para poderes fazer o check-in.')]);
        }

        if ($status === 'fora_da_janela') {
            return back()->withErrors(['reserva' => __('Fora da janela horária permitida para check-in.')]);
        }

        $utilizador = $request->user();
        $ehStaff = $utilizador->isAdministrador() || $utilizador->isGestor();
        $qrToken = $request->input('qr_token');
        $viaQr = $qrToken !== null && $qrToken === $reserva->secretaria?->qr_token;

        /*
         * Utilizador/Colaborador têm de provar que leram o QR físico da
         * secretária — sem isto, bastava conhecer o ID da própria
         * reserva para confirmar o check-in a partir de qualquer lugar,
         * sem alguma vez ter estado no escritório (ver QR-PROVA na
         * auditoria). Administrador/Gestor mantêm a opção de confirmar
         * sem QR (ex.: câmara indisponível, ajudar um visitante), mas
         * essa exceção fica sempre marcada como manual no registo.
         */
        if (! $ehStaff && ! $viaQr) {
            return back()->withErrors([
                'reserva' => __('É necessário ler o QR Code da secretária para confirmar o check-in.'),
            ]);
        }

        $reserva->update([
            'check_in_at' => now(),
        ]);

        $reserva->loadMissing('secretaria.setor');

        ActivityLogger::log(
            $utilizador,
            'checkin_efetuado',
            sprintf(
                '%s · %s%s',
                $reserva->secretaria?->setor?->nome ?? '-',
                $reserva->secretaria?->codigo ?? '-',
                $viaQr ? '' : ' (check-in manual, sem QR)'
            ),
            $reserva,
            ['via' => $viaQr ? 'qr' : 'manual']
        );

        broadcast(new MapaAtualizado());
        DashboardMetricsService::limparCacheDoDia();

        return back()->with('success', __('Check-in confirmado com sucesso.'));
    }

    /**
     * Calcula o estado do fluxo de check-in para uma reserva: já feito, pendente de
     * pagamento, fora da janela horária, ou pronta a confirmar.
     */
    private function statusDaReserva(Reserva $reserva): string
    {
        if ($reserva->check_in_at !== null) {
            return 'ja_check_in';
        }

        if ($reserva->estadoReserva?->codigo === 'pendente') {
            return 'pendente_pagamento';
        }

        if (! $reserva->periodo) {
            return 'pronta';
        }

        /*
         * Numa reserva de vários dias, a janela de check-in é a de HOJE
         * (não a do primeiro dia do plano) — desde que hoje esteja
         * mesmo dentro do intervalo [data, data_fim]. Fora do
         * intervalo (ex.: reserva futura acedida diretamente pelo ID)
         * conta sempre como fora da janela, nunca "pronta" por coincidência
         * de horário.
         */
        $hoje = Carbon::today();
        $dataFimReserva = ($reserva->data_fim ?? $reserva->data)->copy()->startOfDay();

        if ($hoje->lt($reserva->data->copy()->startOfDay()) || $hoje->gt($dataFimReserva)) {
            return 'fora_da_janela';
        }

        $data = $hoje->format('Y-m-d');

        $abreJanela = Carbon::parse("{$data} {$reserva->periodo->hora_inicio->format('H:i')}")
            ->subMinutes(config('reservas.tolerancia_checkin_minutos'));
        $fechaJanela = Carbon::parse("{$data} {$reserva->periodo->hora_fim->format('H:i')}");

        if (! now()->between($abreJanela, $fechaJanela)) {
            return 'fora_da_janela';
        }

        return 'pronta';
    }
}
