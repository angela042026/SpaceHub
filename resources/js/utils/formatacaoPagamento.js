/**
 * Formatação de valores monetários e datas partilhada pelas páginas de
 * Pagamentos — antes duplicada de forma idêntica em Index, Show,
 * Comprovativo e Pagar.
 */

export const formatarValorEuro = (valor) =>
    new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(Number(valor ?? 0));

/**
 * Aceita tanto datas (YYYY-MM-DD) como timestamps (YYYY-MM-DD HH:MM:SS)
 * — usa só os primeiros 10 carateres, ignorando a hora se existir.
 */
export const formatarDataCurta = (valor) => {
    if (!valor) {
        return '-';
    }

    const partes = String(valor).substring(0, 10).split('-');

    if (partes.length !== 3) {
        return '-';
    }

    const [ano, mes, dia] = partes;

    if (!ano || !mes || !dia) {
        return '-';
    }

    return `${dia}/${mes}/${ano}`;
};

/**
 * Encurta visualmente uma referência muito longa, mantendo o início e o
 * fim (ex: "SPH-AADV…AQM"). A referência completa permanece disponível
 * no atributo title (tooltip) e num nó sr-only, para não perder nada
 * nos detalhes nem para tecnologias assistivas.
 */
export const encurtarReferencia = (referencia, limite = 14) => {
    if (!referencia) {
        return '-';
    }

    if (referencia.length <= limite) {
        return referencia;
    }

    return `${referencia.slice(0, 8)}…${referencia.slice(-3)}`;
};

/**
 * Formato fixo "dd/mm/aaaa · HH:mm" — os presets dateStyle/timeStyle do
 * Intl dão ano com 2 dígitos e vírgula como separador em pt-PT, que não
 * é o formato usado nas páginas de Pagamentos.
 */
export const formatarDataHora = (valor) => {
    if (!valor) {
        return '-';
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return formatarDataCurta(valor);
    }

    const dataFormatada = new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(data);

    const horaFormatada = new Intl.DateTimeFormat('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(data);

    return `${dataFormatada} · ${horaFormatada}`;
};
