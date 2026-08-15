import {
    Building2,
    CalendarCheck,
    CalendarClock,
    CalendarPlus,
    CalendarX,
    CreditCard,
    LogIn,
    UserCheck,
    UserCog,
    UserPlus,
    UserX,
} from 'lucide-react';

/**
 * Badge + ícone de cada ação do Registo de Atividade — cor pelo verbo
 * (turquesa=criação, azul=edição, verde=sucesso/check-in, vermelho
 * suave=cancelamento), nunca aleatória. A cor "automático" fica só no
 * badge de Resultado (ver RESULTADO_ATIVIDADE), para não misturar os
 * dois critérios no mesmo badge.
 */
export const ACAO_ATIVIDADE = {
    reserva_criada: {
        label: 'Reserva criada',
        icon: CalendarPlus,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    reserva_editada: {
        label: 'Reserva editada',
        icon: CalendarClock,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    reserva_cancelada: {
        label: 'Reserva cancelada',
        icon: CalendarX,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    reserva_concluida: {
        label: 'Reserva concluída',
        icon: CalendarCheck,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    reserva_nao_compareceu: {
        label: 'Reserva - não compareceu',
        icon: CalendarX,
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    },

    checkin_efetuado: {
        label: 'Check-in efetuado',
        icon: LogIn,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },

    pagamento_atualizado: {
        label: 'Pagamento atualizado',
        icon: CreditCard,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },

    utilizador_criado: {
        label: 'Utilizador criado',
        icon: UserPlus,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    utilizador_atualizado: {
        label: 'Utilizador atualizado',
        icon: UserCog,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    utilizador_ativado: {
        label: 'Utilizador ativado',
        icon: UserCheck,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    utilizador_desativado: {
        label: 'Utilizador desativado',
        icon: UserX,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },

    espaco_criado: {
        label: 'Espaço criado',
        icon: Building2,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    espaco_atualizado: {
        label: 'Espaço atualizado',
        icon: Building2,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    espaco_ativado: {
        label: 'Espaço ativado',
        icon: Building2,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    espaco_desativado: {
        label: 'Espaço desativado',
        icon: Building2,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
};

/** Badge do resultado — "automatic" é o único sítio com a cor cinza-azulado. */
export const RESULTADO_ATIVIDADE = {
    success: {
        label: 'Sucesso',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    cancelled: {
        label: 'Cancelada',
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    automatic: {
        label: 'Automático',
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    },
    error: {
        label: 'Erro',
        badge: 'bg-red-500/10 text-red-700 dark:text-red-400',
    },
};

/** Nome amigável da entidade afetada, a partir da classe PHP guardada em subject_type. */
export const ENTIDADE_LABELS = {
    'App\\Models\\Reserva': 'Reserva',
    'App\\Models\\User': 'Utilizador',
    'App\\Models\\Pagamento': 'Pagamento',
    'App\\Models\\Setor': 'Setor',
    'App\\Models\\Secretaria': 'Secretária',
    'App\\Models\\Edificio': 'Edifício',
    'App\\Models\\Piso': 'Piso',
};
