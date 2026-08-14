/**
 * Cores e etiquetas dos estados apresentados em badges.
 *
 * Antes cada página redefinia estes mapas: ESTADO_CLASSES estava em 7
 * ficheiros, ESTADO_BADGE em 4 e METODO_LABELS em 3. As cópias já tinham
 * começado a divergir — ver as notas em METODO_PAGAMENTO e ESTADO_SUPORTE.
 *
 * Todos os mapas têm a mesma forma, { badge, label }, para o sítio onde
 * são usados ser sempre igual. Os estados de reserva acrescentam um
 * "dot", usado pelo cartão do dashboard.
 */

/** Cor de recurso para um estado que o mapa não conhece. */
export const BADGE_NEUTRO =
    'bg-slate-500/10 text-slate-600 dark:text-slate-400';

/** Estados de uma reserva (coluna codigo da tabela estado_reservas). */
export const ESTADO_RESERVA = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Pendente',
    },
    confirmada: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        dot: 'bg-teal-500',
        label: 'Confirmada',
    },
    cancelada: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'Cancelada',
    },
    expirada: {
        badge: BADGE_NEUTRO,
        dot: 'bg-slate-400',
        label: 'Expirada',
    },
    concluida: {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        label: 'Concluída',
    },
    nao_compareceu: {
        badge: BADGE_NEUTRO,
        dot: 'bg-slate-400',
        label: 'Não compareceu',
    },
};

/** Estados de moderação de uma avaliação. */
export const ESTADO_AVALIACAO = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'Pendente',
    },
    aprovada: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'Aprovada',
    },
    rejeitada: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'Rejeitada',
    },
};

/** Estados de um pagamento. */
export const ESTADO_PAGAMENTO = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'Pendente',
    },
    pago: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'Pago',
    },
    recusado: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'Recusado',
    },
    reembolsado: {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label: 'Reembolsado',
    },
    cancelado: {
        badge: BADGE_NEUTRO,
        label: 'Cancelado',
    },
};

/**
 * Métodos de pagamento.
 *
 * A lista de pagamentos mostrava "Transferência" enquanto o comprovativo
 * e o detalhe mostravam "Transferência bancária". Ficou a versão dos dois
 * últimos, que é a mais explícita.
 */
export const METODO_PAGAMENTO = {
    cartao: { label: 'Cartão', imagem: '/images/payment/cartao.jpeg' },
    mbway: { label: 'MB Way', imagem: '/images/payment/mbway.jpeg' },
    transferencia: { label: 'Transferência bancária', imagem: '/images/payment/transferencia.jpeg' },
    paypal: { label: 'PayPal', imagem: '/images/payment/paypal.jpeg' },
};

/**
 * Estados de um pedido de suporte. Ao contrário dos outros, a chave é o
 * próprio texto guardado na base de dados.
 *
 * "Em análise" só estava definido no formulário de suporte; a listagem e
 * o detalhe não o conheciam e mostravam-no a cinzento. Passa a ter a cor
 * certa nos três sítios.
 */
export const ESTADO_SUPORTE = {
    Pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'Pendente',
    },
    'Em análise': {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label: 'Em análise',
    },
    Resolvido: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'Resolvido',
    },
};

/** Estado ativo/inativo de um utilizador, com a chave em texto. */
export const ESTADO_UTILIZADOR = {
    true: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'Ativo',
    },
    false: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'Inativo',
    },
};

/** Classes do badge de um estado, ou a cor neutra se for desconhecido. */
export const badge = (mapa, chave) => mapa[chave]?.badge ?? BADGE_NEUTRO;

/**
 * Texto de um estado. Sem correspondência devolve a própria chave, que
 * é mais útil do que um espaço em branco; passa-se `omissao` para
 * escolher outro texto.
 */
export const etiqueta = (mapa, chave, omissao = chave) =>
    mapa[chave]?.label ?? omissao;
