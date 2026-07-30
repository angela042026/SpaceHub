<?php

return [

    /*
    |--------------------------------------------------------------------
    | Tolerância de check-in
    |--------------------------------------------------------------------
    |
    | Minutos de tolerância à volta do início do período de uma reserva.
    | Usado tanto para marcar uma secretária como "a expirar" no mapa
    | (MapaOcupacaoService) como para cancelar automaticamente reservas
    | sem check-in (comando reservas:cancelar-expiradas).
    |
    */
    'tolerancia_checkin_minutos' => env('RESERVAS_TOLERANCIA_CHECKIN_MINUTOS', 30),

    /*
    |--------------------------------------------------------------------
    | Limites do dashboard
    |--------------------------------------------------------------------
    |
    | Quantidade de resultados apresentados nos rankings de estatísticas
    | (secretárias/pisos/setores/utilizadores mais usados, etc.) e no
    | painel de atividade recente.
    |
    */
    'dashboard' => [
        'top_ranking' => env('DASHBOARD_TOP_RANKING', 5),
        'atividade_recente' => env('DASHBOARD_ATIVIDADE_RECENTE', 8),
    ],

];
