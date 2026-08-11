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

// Marca como concluídas as reservas confirmadas cuja data já passou.
Schedule::command('reservas:marcar-concluidas')
    ->dailyAt('00:05')
    ->withoutOverlapping();
