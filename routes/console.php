<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Liberta secretárias cujas reservas pendentes não tiveram check-in a tempo.
// Nota operacional: requer o scheduler do Laravel a correr no servidor
// (`* * * * * php artisan schedule:run` no crontab).
Schedule::command('reservas:cancelar-expiradas')
    ->everyMinute()
    ->withoutOverlapping();

// Cancela reservas cujo pagamento continua pendente 30 minutos após a criação.
Schedule::command('pagamentos:cancelar-pendentes-expirados')
    ->everyMinute()
    ->withoutOverlapping();

// Marca como concluídas (ou não compareceu) as reservas confirmadas cujo
// período já terminou — de 15 em 15 minutos, para o estado "Confirmada"
// não ficar errado o resto do dia depois de o período de hoje acabar.
Schedule::command('reservas:marcar-concluidas')
    ->everyFifteenMinutes()
    ->withoutOverlapping();

// Liberta, dia a dia, reservas confirmadas sem check-in dentro da
// tolerância — mesma cadência de reservas:cancelar-expiradas, porque
// também depende de uma janela de tolerância sensível ao minuto.
Schedule::command('reservas:liberar-nao-comparecimentos')
    ->everyMinute()
    ->withoutOverlapping();
