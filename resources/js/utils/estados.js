import i18n from '@/i18n';

/**
 * Cores e etiquetas dos estados apresentados em badges.
 *
 * Antes cada página redefinia estes mapas: ESTADO_CLASSES estava em 7
 * ficheiros, ESTADO_BADGE em 4 e METODO_LABELS em 3. As cópias já tinham
 * começado a divergir — ver as notas em METODO_PAGAMENTO e ESTADO_SUPORTE.
 *
 * Todos os mapas têm a mesma forma, { badge, label }, para o sítio onde
 * são usados ser sempre igual. Os estados de reserva acrescentam um
 * "dot", usado pelo cartão do dashboard. `label` guarda uma CHAVE de
 * tradução (namespace "common"), não o texto em si — os valores
 * persistidos na BD continuam em português, só a apresentação muda
 * (ver etiqueta()).
 */

/** Cor de recurso para um estado que o mapa não conhece. */
export const BADGE_NEUTRO =
    'bg-slate-500/10 text-slate-600 dark:text-slate-400';

/** Estados de uma reserva (coluna codigo da tabela estado_reservas). */
export const ESTADO_RESERVA = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'estados.reserva.pendente',
    },
    confirmada: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        dot: 'bg-teal-500',
        label: 'estados.reserva.confirmada',
    },
    cancelada: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'estados.reserva.cancelada',
    },
    expirada: {
        badge: BADGE_NEUTRO,
        dot: 'bg-slate-400',
        label: 'estados.reserva.expirada',
    },
    concluida: {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        label: 'estados.reserva.concluida',
    },
    nao_compareceu: {
        badge: BADGE_NEUTRO,
        dot: 'bg-slate-400',
        label: 'estados.reserva.nao_compareceu',
    },
};

/** Estados de moderação de uma avaliação. */
export const ESTADO_AVALIACAO = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'estados.avaliacao.pendente',
    },
    aprovada: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'estados.avaliacao.aprovada',
    },
    rejeitada: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'estados.avaliacao.rejeitada',
    },
};

/** Estados de um pagamento. */
export const ESTADO_PAGAMENTO = {
    pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'estados.pagamento.pendente',
    },
    pago: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'estados.pagamento.pago',
    },
    recusado: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'estados.pagamento.recusado',
    },
    reembolsado: {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label: 'estados.pagamento.reembolsado',
    },
    cancelado: {
        badge: BADGE_NEUTRO,
        label: 'estados.pagamento.cancelado',
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
    cartao: { label: 'estados.metodoPagamento.cartao', imagem: '/images/payment/cartao.jpeg' },
    mbway: { label: 'estados.metodoPagamento.mbway', imagem: '/images/payment/mbway.jpeg' },
    transferencia: { label: 'estados.metodoPagamento.transferencia', imagem: '/images/payment/transferencia.jpeg' },
    paypal: { label: 'estados.metodoPagamento.paypal', imagem: '/images/payment/paypal.jpeg' },
};

/**
 * Estados de um pedido de suporte. Ao contrário dos outros, a chave é o
 * próprio texto guardado na base de dados (em português) — só o texto
 * apresentado muda com o idioma, o valor persistido mantém-se.
 *
 * "Em análise" só estava definido no formulário de suporte; a listagem e
 * o detalhe não o conheciam e mostravam-no a cinzento. Passa a ter a cor
 * certa nos três sítios.
 */
export const ESTADO_SUPORTE = {
    Pendente: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'estados.suporte.Pendente',
    },
    'Em análise': {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label: 'estados.suporte.Em análise',
    },
    Resolvido: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'estados.suporte.Resolvido',
    },
};

/** Estado ativo/inativo de um utilizador, com a chave em texto. */
export const ESTADO_UTILIZADOR = {
    true: {
        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'estados.utilizador.true',
    },
    false: {
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        label: 'estados.utilizador.false',
    },
};

/**
 * Nome do período (coluna `nome` da tabela `periodos` — "Manhã",
 * "Tarde", "Dia inteiro"). Ao contrário dos outros mapas, a chave de
 * tradução é o próprio texto em português, porque a tabela não tem um
 * `codigo` estável separado do nome apresentado.
 */
export const PERIODO_LABEL = {
    Manhã: 'estados.periodo.manha',
    Tarde: 'estados.periodo.tarde',
    'Dia inteiro': 'estados.periodo.diaInteiro',
};

/** Traduz o nome de um período, devolvendo o valor original se for desconhecido. */
export const etiquetaPeriodo = (nome, t) => {
    const chaveTraducao = PERIODO_LABEL[nome];

    if (!chaveTraducao) {
        return nome;
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
};

/** Classes do badge de um estado, ou a cor neutra se for desconhecido. */
export const badge = (mapa, chave) => mapa[chave]?.badge ?? BADGE_NEUTRO;

/**
 * Texto de um estado. Sem correspondência devolve a própria chave, que
 * é mais útil do que um espaço em branco; passa-se `omissao` para
 * escolher outro texto.
 *
 * `t` é opcional — passa a função devolvida por `useTranslation('common')`
 * do componente que chama isto, para o texto atualizar de imediato
 * quando o idioma muda (o componente já está subscrito a essa mudança
 * por usar o hook). Sem `t`, cai para a instância global do i18next —
 * funciona, mas só atualiza no próximo re-render do componente.
 */
export const etiqueta = (mapa, chave, omissao = chave, t) => {
    const chaveTraducao = mapa[chave]?.label;

    if (!chaveTraducao) {
        return omissao;
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
};
