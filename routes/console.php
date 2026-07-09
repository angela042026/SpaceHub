<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());})
    ->purpose('Display an inspiring quote');

// Executa automaticamente o cancelamento das reservas sem check-in a cada minuto.
Schedule::command('app:cancelar-reservas-sem-check-in')
    ->everyMinute();
