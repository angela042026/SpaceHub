/**
 * Datas e moeda por locale — pt-PT/en-GB, EUR sempre (a app não muda
 * de moeda, só de idioma). Centraliza o que antes eram ~26 chamadas
 * `toLocaleDateString('pt-PT', ...)` espalhadas pelo frontend.
 */

const INTL_LOCALE = {
    pt: 'pt-PT',
    en: 'en-GB',
};

function resolverIntlLocale(locale) {
    return INTL_LOCALE[locale] ?? INTL_LOCALE.pt;
}

export function formatarData(data, locale, opcoes = {}) {
    if (!data) {
        return '-';
    }

    return new Intl.DateTimeFormat(resolverIntlLocale(locale), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...opcoes,
    }).format(new Date(data));
}

export function formatarDataCurta(data, locale) {
    if (!data) {
        return '-';
    }

    return new Intl.DateTimeFormat(resolverIntlLocale(locale), {
        day: '2-digit',
        month: 'short',
    }).format(new Date(data));
}

export function formatarHora(data, locale, opcoes = {}) {
    if (!data) {
        return '-';
    }

    return new Intl.DateTimeFormat(resolverIntlLocale(locale), {
        hour: '2-digit',
        minute: '2-digit',
        ...opcoes,
    }).format(new Date(data));
}

export function formatarDataHora(data, locale) {
    if (!data) {
        return '-';
    }

    return new Intl.DateTimeFormat(resolverIntlLocale(locale), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(data));
}

export function formatarMoeda(valor, locale) {
    return new Intl.NumberFormat(resolverIntlLocale(locale), {
        style: 'currency',
        currency: 'EUR',
    }).format(Number(valor ?? 0));
}
