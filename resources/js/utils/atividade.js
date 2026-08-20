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

import i18n from '@/i18n';

/**
 * Badge + ícone de cada ação do Registo de Atividade — cor pelo verbo
 * (turquesa=criação, azul=edição, verde=sucesso/check-in, vermelho
 * suave=cancelamento), nunca aleatória. A cor "automático" fica só no
 * badge de Resultado (ver RESULTADO_ATIVIDADE), para não misturar os
 * dois critérios no mesmo badge.
 *
 * `label` guarda uma CHAVE de tradução (namespace "admin"), não o texto
 * em si — ver a nota equivalente em utils/estados.js.
 */
export const ACAO_ATIVIDADE = {
    reserva_criada: {
        label: 'atividade.acoes.reserva_criada',
        icon: CalendarPlus,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    reserva_editada: {
        label: 'atividade.acoes.reserva_editada',
        icon: CalendarClock,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    reserva_cancelada: {
        label: 'atividade.acoes.reserva_cancelada',
        icon: CalendarX,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    reserva_concluida: {
        label: 'atividade.acoes.reserva_concluida',
        icon: CalendarCheck,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    reserva_nao_compareceu: {
        label: 'atividade.acoes.reserva_nao_compareceu',
        icon: CalendarX,
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    },

    checkin_efetuado: {
        label: 'atividade.acoes.checkin_efetuado',
        icon: LogIn,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },

    pagamento_atualizado: {
        label: 'atividade.acoes.pagamento_atualizado',
        icon: CreditCard,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },

    utilizador_criado: {
        label: 'atividade.acoes.utilizador_criado',
        icon: UserPlus,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    utilizador_atualizado: {
        label: 'atividade.acoes.utilizador_atualizado',
        icon: UserCog,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    utilizador_ativado: {
        label: 'atividade.acoes.utilizador_ativado',
        icon: UserCheck,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    utilizador_desativado: {
        label: 'atividade.acoes.utilizador_desativado',
        icon: UserX,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },

    espaco_criado: {
        label: 'atividade.acoes.espaco_criado',
        icon: Building2,
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    espaco_atualizado: {
        label: 'atividade.acoes.espaco_atualizado',
        icon: Building2,
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    espaco_ativado: {
        label: 'atividade.acoes.espaco_ativado',
        icon: Building2,
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    espaco_desativado: {
        label: 'atividade.acoes.espaco_desativado',
        icon: Building2,
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
};

/** Badge do resultado — "automatic" é o único sítio com a cor cinza-azulado. */
export const RESULTADO_ATIVIDADE = {
    success: {
        label: 'atividade.resultados.success',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    cancelled: {
        label: 'atividade.resultados.cancelled',
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    automatic: {
        label: 'atividade.resultados.automatic',
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    },
    error: {
        label: 'atividade.resultados.error',
        badge: 'bg-red-500/10 text-red-700 dark:text-red-400',
    },
};

/** Nome amigável da entidade afetada, a partir da classe PHP guardada em subject_type. */
export const ENTIDADE_LABELS = {
    'App\\Models\\Reserva': 'atividade.entidades.reserva',
    'App\\Models\\User': 'atividade.entidades.utilizador',
    'App\\Models\\Pagamento': 'atividade.entidades.pagamento',
    'App\\Models\\Setor': 'atividade.entidades.setor',
    'App\\Models\\Secretaria': 'atividade.entidades.secretaria',
    'App\\Models\\Edificio': 'atividade.entidades.edificio',
    'App\\Models\\Piso': 'atividade.entidades.piso',
};

/**
 * `t` é opcional — passa o `t` de `useTranslation('admin')` do componente
 * que chama isto, para o texto atualizar de imediato quando o idioma
 * muda. Sem `t`, cai para a instância global do i18next.
 */
export function acaoLabel(acao, t) {
    const chaveTraducao = ACAO_ATIVIDADE[acao]?.label;

    if (!chaveTraducao) {
        return acao ?? '-';
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
}

export function resultadoLabel(resultado, t) {
    const chaveTraducao = RESULTADO_ATIVIDADE[resultado]?.label;

    if (!chaveTraducao) {
        return resultado ?? '-';
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
}

export function entidadeLabel(subjectType, t) {
    const chaveTraducao = ENTIDADE_LABELS[subjectType];

    if (!chaveTraducao) {
        return subjectType;
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
}
