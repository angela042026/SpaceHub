export const ESTADOS = {
    livre: {
        marker: 'bg-status-livre',
        soft: 'bg-teal-500/10',
        text: 'text-teal-600 dark:text-teal-400',
        label: 'Livre',
    },

    reservada: {
        marker: 'bg-status-reservada',
        soft: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        label: 'Parcialmente ocupada',
    },

    expira: {
        marker: 'bg-status-expira',
        soft: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        label: 'Reservada — a começar em breve',
    },

    ocupada: {
        marker: 'bg-status-ocupada',
        soft: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        label: 'Ocupada',
    },

    indisponivel: {
        marker: 'bg-status-indisponivel',
        soft: 'bg-slate-500/10',
        text: 'text-slate-500 dark:text-slate-400',
        label: 'Manutenção',
    },
};

export const FILTROS = {
    todos: {
        label: 'Todas',
        dot: 'bg-slate-400',
        active:
            'border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-900',
    },

    livre: {
        label: 'Livres',
        dot: 'bg-status-livre',
        active:
            'border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/20',
    },

    reservada: {
        label: 'Reservadas',
        dot: 'bg-status-reservada',
        active:
            'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20',
    },

    ocupada: {
        label: 'Ocupadas',
        dot: 'bg-status-ocupada',
        active:
            'border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20',
    },

    indisponivel: {
        label: 'Manutenção',
        dot: 'bg-status-indisponivel',
        active:
            'border-slate-500 bg-slate-500 text-white shadow-md shadow-slate-500/20',
    },
};

export function getEstado(status) {
    return ESTADOS[status] ?? ESTADOS.indisponivel;
}

export function normalizarEstadoFiltro(status) {
    if (status === 'expira') {
        return 'reservada';
    }

    return status;
}

export function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export function correspondePesquisa(secretaria, pesquisa) {
    const termo = normalizarTexto(pesquisa);

    if (!termo) {
        return true;
    }

    const codigo = normalizarTexto(secretaria.codigo);
    const numero = normalizarTexto(secretaria.numero);

    return (
        codigo.includes(termo) ||
        numero.includes(termo)
    );
}

export function correspondeFiltro(secretaria, filtroEstado) {
    if (filtroEstado === 'todos') {
        return true;
    }

    return (
        normalizarEstadoFiltro(secretaria.status) ===
        filtroEstado
    );
}
