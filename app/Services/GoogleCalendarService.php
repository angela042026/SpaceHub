<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Sincronização de reservas com o Google Calendar do próprio utilizador.
 *
 * Chamadas diretas à API REST do Google (sem o pacote google/apiclient,
 * pesado a mais para o que aqui é preciso: trocar/renovar um token e
 * criar/apagar um evento).
 *
 * Falhas nunca sobem para quem chama — sincronizar o calendário é um
 * extra, nunca deve impedir criar ou cancelar uma reserva. Ficam só
 * registadas no log.
 */
class GoogleCalendarService
{
    private const AUTORIZAR_URL = 'https://oauth2.googleapis.com/token';
    private const EVENTOS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    private const FUSO_HORARIO = 'Europe/Lisbon';

    /**
     * Guarda os tokens devolvidos pelo Socialite depois de o utilizador
     * autorizar o acesso ao calendário.
     *
     * O refresh_token só vem preenchido na primeira autorização (ou
     * quando se força prompt=consent) — se vier vazio numa reautorização,
     * mantém-se o que já estava guardado, em vez de o apagar.
     */
    public function guardarTokens(
        User $user,
        string $accessToken,
        ?string $refreshToken,
        int $expiraEmSegundos
    ): void {
        $user->update([
            'google_calendar_access_token' => $accessToken,
            'google_calendar_refresh_token' => $refreshToken ?? $user->google_calendar_refresh_token,
            'google_calendar_token_expira_em' => now()->addSeconds($expiraEmSegundos),
        ]);
    }

    /**
     * Desliga o Google Calendar desta conta — limpa os tokens guardados.
     */
    public function desconectar(User $user): void
    {
        $user->update([
            'google_calendar_access_token' => null,
            'google_calendar_refresh_token' => null,
            'google_calendar_token_expira_em' => null,
        ]);
    }

    /**
     * Cria (ou recria) o evento da reserva no Google Calendar do
     * utilizador, se este tiver o calendário ligado.
     */
    public function sincronizarReserva(Reserva $reserva): void
    {
        $user = $reserva->user;

        if ($user === null || ! $user->googleCalendarConectado()) {
            return;
        }

        $accessToken = $this->accessTokenValido($user);

        if ($accessToken === null) {
            return;
        }

        $payload = $this->construirPayloadEvento($reserva);

        if ($payload === null) {
            return;
        }

        try {
            $resposta = Http::withToken($accessToken)
                ->post(self::EVENTOS_URL, $payload);

            if ($resposta->successful()) {
                $reserva->update([
                    'google_event_id' => $resposta->json('id'),
                ]);
            } else {
                Log::warning('Falha ao criar evento no Google Calendar.', [
                    'reserva_id' => $reserva->id,
                    'status' => $resposta->status(),
                    'resposta' => $resposta->json(),
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('Erro ao sincronizar reserva com o Google Calendar.', [
                'reserva_id' => $reserva->id,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Remove o evento associado a uma reserva cancelada, se existir.
     */
    public function removerEvento(Reserva $reserva): void
    {
        $user = $reserva->user;

        if ($user === null || ! $user->googleCalendarConectado() || $reserva->google_event_id === null) {
            return;
        }

        $accessToken = $this->accessTokenValido($user);

        if ($accessToken === null) {
            return;
        }

        try {
            Http::withToken($accessToken)
                ->delete(self::EVENTOS_URL . '/' . $reserva->google_event_id);
        } catch (Throwable $e) {
            Log::warning('Erro ao remover evento do Google Calendar.', [
                'reserva_id' => $reserva->id,
                'erro' => $e->getMessage(),
            ]);
        } finally {
            $reserva->update(['google_event_id' => null]);
        }
    }

    /**
     * Access token válido para chamar a API, renovando-o através do
     * refresh_token quando já expirou. Devolve null se não for possível
     * obter um token válido (ex.: o utilizador revogou o acesso).
     */
    private function accessTokenValido(User $user): ?string
    {
        $expiraEm = $user->google_calendar_token_expira_em;

        if (
            $user->google_calendar_access_token !== null
            && $expiraEm !== null
            && now()->addMinute()->lessThan($expiraEm)
        ) {
            return $user->google_calendar_access_token;
        }

        try {
            $resposta = Http::asForm()->post(self::AUTORIZAR_URL, [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'refresh_token' => $user->google_calendar_refresh_token,
                'grant_type' => 'refresh_token',
            ]);

            if (! $resposta->successful()) {
                Log::warning('Não foi possível renovar o token do Google Calendar — a desligar.', [
                    'user_id' => $user->id,
                    'status' => $resposta->status(),
                ]);

                $this->desconectar($user);

                return null;
            }

            $this->guardarTokens(
                $user,
                $resposta->json('access_token'),
                null,
                (int) $resposta->json('expires_in')
            );

            return $resposta->json('access_token');
        } catch (Throwable $e) {
            Log::warning('Erro ao renovar o token do Google Calendar.', [
                'user_id' => $user->id,
                'erro' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Monta o corpo do pedido de criação do evento a partir da reserva.
     *
     * Devolve null quando falta alguma data essencial (ex.: reserva sem
     * período associado) — nesse caso não há evento fiável para criar.
     */
    private function construirPayloadEvento(Reserva $reserva): ?array
    {
        $reserva->loadMissing(['secretaria.setor.piso.edificio', 'periodo']);

        $periodo = $reserva->periodo;
        $secretaria = $reserva->secretaria;
        $setor = $secretaria?->setor;

        if ($periodo === null || $reserva->data === null) {
            return null;
        }

        $dataInicio = Carbon::parse($reserva->data)->toDateString();
        $dataFim = Carbon::parse($reserva->data_fim ?? $reserva->data)->toDateString();

        $horaInicio = $periodo->hora_inicio?->format('H:i:s');
        $horaFim = $periodo->hora_fim?->format('H:i:s');

        if ($horaInicio === null || $horaFim === null) {
            return null;
        }

        $edificio = $setor?->piso?->edificio?->nome;
        $piso = $setor?->piso?->numero;

        $localizacao = collect([
            $edificio,
            $piso !== null ? "Piso {$piso}" : null,
        ])->filter()->join(' · ');

        return [
            'summary' => sprintf(
                'Reserva - %s (%s)',
                $setor?->nome ?? 'Espaço',
                $secretaria?->codigo ?? '-'
            ),
            'location' => $localizacao,
            'description' => sprintf(
                "Código: %s\nPeríodo: %s",
                $secretaria?->codigo ?? '-',
                $periodo->nome ?? '-'
            ),
            'start' => [
                'dateTime' => "{$dataInicio}T{$horaInicio}",
                'timeZone' => self::FUSO_HORARIO,
            ],
            'end' => [
                'dateTime' => "{$dataFim}T{$horaFim}",
                'timeZone' => self::FUSO_HORARIO,
            ],
        ];
    }
}
