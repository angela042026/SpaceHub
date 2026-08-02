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

export const formatarDataHora = (valor) => {
    if (!valor) {
        return '-';
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return formatarDataCurta(valor);
    }

    return new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(data);
};
