import {
    Armchair,
    Coffee,
    Grid2x2,
    Monitor,
    Sun,
    Usb,
    Volume2,
    Zap,
} from 'lucide-react';
import i18n from '@/i18n';

export const MIN_ZOOM = 0.85;
export const MAX_ZOOM = 2.4;
export const ZOOM_STEP = 0.15;

export function limitarZoom(valor) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, valor));
}

// Comodidades filtráveis da secretária — chave (coluna booleana no
// backend), chave de tradução (namespace "dashboard") e ícone. Usado no
// marcador expandido e no painel de detalhe da secretária selecionada.
export const COMODIDADES = [
    ['ergonomica', 'officeMap.comodidades.ergonomica', Armchair],
    ['monitor', 'officeMap.comodidades.monitor', Monitor],
    ['dock_usb', 'officeMap.comodidades.dockUsb', Usb],
    ['hdmi', 'officeMap.comodidades.hdmi', Zap],
    ['junto_janela', 'officeMap.comodidades.juntoJanela', Grid2x2],
    ['luz_natural', 'officeMap.comodidades.luzNatural', Sun],
    ['zona_silenciosa', 'officeMap.comodidades.zonaSilenciosa', Volume2],
    ['proximo_copa', 'officeMap.comodidades.proximoCopa', Coffee],
];

/** Traduz o rótulo de uma comodidade (ver COMODIDADES acima). */
export const traduzirComodidade = (chaveTraducao, t) =>
    (t ?? i18n.t.bind(i18n))(chaveTraducao);

// Cores de destaque (anel/texto/barra) por estado, usadas nos marcadores em
// forma de pin e na timeline de disponibilidade. `label` guarda a chave de
// tradução (namespace "dashboard"), não o texto em si.
export const ESTADO_VISUAL = {
    livre: {
        ring: 'border-teal-400',
        text: 'text-teal-600',
        bar: 'bg-teal-500',
        badgeBg: 'bg-teal-50',
        badgeText: 'text-teal-700',
        label: 'officeMap.estados.livre',
    },
    reservada: {
        ring: 'border-amber-400',
        text: 'text-amber-600',
        bar: 'bg-amber-500',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        label: 'officeMap.estados.reservada',
    },
    ocupada: {
        ring: 'border-red-400',
        text: 'text-red-600',
        bar: 'bg-red-500',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-700',
        label: 'officeMap.estados.ocupada',
    },
    indisponivel: {
        ring: 'border-slate-300',
        text: 'text-slate-500',
        bar: 'bg-slate-300',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
        label: 'officeMap.estados.indisponivel',
    },
};

/** Traduz o rótulo de um estado visual (ver ESTADO_VISUAL acima). */
export const traduzirEstadoVisual = (chave, t) =>
    (t ?? i18n.t.bind(i18n))(ESTADO_VISUAL[chave]?.label ?? chave);

export const FILTROS = [
    ['todos', 'officeMap.filtros.todas'],
    ['livre', 'officeMap.filtros.livres'],
    ['reservada', 'officeMap.filtros.reservadas'],
    ['ocupada', 'officeMap.filtros.ocupadas'],
    ['indisponivel', 'officeMap.filtros.indisponiveis'],
];

/** Traduz o rótulo de um filtro de estado (ver FILTROS acima). */
export const traduzirFiltro = (chaveTraducao, t) =>
    (t ?? i18n.t.bind(i18n))(chaveTraducao);

export function normalizarEstadoFiltro(status) {
    if (status === 'expira') {
        return 'reservada';
    }

    return status;
}

export function estadoNormalizado(status) {
    return normalizarEstadoFiltro(status) ?? 'indisponivel';
}

export function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
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
    const nomeSetor = normalizarTexto(secretaria.setor?.nome);

    return (
        codigo.includes(termo) ||
        numero.includes(termo) ||
        nomeSetor.includes(termo)
    );
}

// Converte 'HH:mm' no número de minutos desde a meia-noite, para
// posicionar os blocos na timeline de disponibilidade (00h–24h).
export function minutosDoDia(hora) {
    if (!hora) {
        return 0;
    }

    const [horas, minutos] = String(hora)
        .slice(0, 5)
        .split(':')
        .map(Number);

    return horas * 60 + minutos;
}
