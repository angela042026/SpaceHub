import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Namespaces por domínio — mantidos como ficheiros separados para cada
// página só puxar o que precisa via useTranslation('dominio'), em vez
// de um único JSON gigante partilhado por toda a aplicação.
import ptCommon from './locales/pt/common.json';
import ptLanding from './locales/pt/landing.json';
import ptAuth from './locales/pt/auth.json';
import ptReservas from './locales/pt/reservas.json';
import ptPagamentos from './locales/pt/pagamentos.json';
import ptDashboard from './locales/pt/dashboard.json';
import ptAdmin from './locales/pt/admin.json';
import ptEstatisticas from './locales/pt/estatisticas.json';
import ptRelatorios from './locales/pt/relatorios.json';
import ptAvaliacoes from './locales/pt/avaliacoes.json';
import ptSuporte from './locales/pt/suporte.json';
import ptProfile from './locales/pt/profile.json';
import ptMapa from './locales/pt/mapa.json';
import ptQrcode from './locales/pt/qrcode.json';
import ptValidation from './locales/pt/validation.json';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enAuth from './locales/en/auth.json';
import enReservas from './locales/en/reservas.json';
import enPagamentos from './locales/en/pagamentos.json';
import enDashboard from './locales/en/dashboard.json';
import enAdmin from './locales/en/admin.json';
import enEstatisticas from './locales/en/estatisticas.json';
import enRelatorios from './locales/en/relatorios.json';
import enAvaliacoes from './locales/en/avaliacoes.json';
import enSuporte from './locales/en/suporte.json';
import enProfile from './locales/en/profile.json';
import enMapa from './locales/en/mapa.json';
import enQrcode from './locales/en/qrcode.json';
import enValidation from './locales/en/validation.json';

export const LOCALES_SUPORTADOS = ['pt', 'en'];

const resources = {
    pt: {
        common: ptCommon,
        landing: ptLanding,
        auth: ptAuth,
        reservas: ptReservas,
        pagamentos: ptPagamentos,
        dashboard: ptDashboard,
        admin: ptAdmin,
        estatisticas: ptEstatisticas,
        relatorios: ptRelatorios,
        avaliacoes: ptAvaliacoes,
        suporte: ptSuporte,
        profile: ptProfile,
        mapa: ptMapa,
        qrcode: ptQrcode,
        validation: ptValidation,
    },
    en: {
        common: enCommon,
        landing: enLanding,
        auth: enAuth,
        reservas: enReservas,
        pagamentos: enPagamentos,
        dashboard: enDashboard,
        admin: enAdmin,
        estatisticas: enEstatisticas,
        relatorios: enRelatorios,
        avaliacoes: enAvaliacoes,
        suporte: enSuporte,
        profile: enProfile,
        mapa: enMapa,
        qrcode: enQrcode,
        validation: enValidation,
    },
};

/**
 * O idioma vem sempre do Laravel (prop `locale` partilhada via
 * Inertia, resolvida por sessão/cookie no SetLocale middleware) — não
 * há deteção de idioma do browser a competir com essa fonte de
 * verdade. Os recursos já estão todos em memória (import estático),
 * por isso init() fica pronto no mesmo tick, sem flash de conteúdo.
 */
export function initI18n(localeInicial) {
    const locale = LOCALES_SUPORTADOS.includes(localeInicial)
        ? localeInicial
        : 'pt';

    i18n.use(initReactI18next).init({
        resources,
        lng: locale,
        fallbackLng: 'pt',
        ns: Object.keys(resources.pt),
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
        returnEmptyString: false,
    });

    return i18n;
}

export default i18n;
