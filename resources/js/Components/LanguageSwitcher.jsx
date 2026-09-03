import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ChevronDown, Globe2 } from 'lucide-react';
import { LOCALES_SUPORTADOS } from '@/i18n';

/**
 * Troca de idioma real: atualiza o i18next no cliente de imediato (sem
 * flash) e persiste em sessão/cookie no servidor em paralelo, via
 * axios simples — sem passar pelo router do Inertia, para não
 * reconciliar props da página atual só por causa disto.
 */
function trocarIdioma(i18n, locale) {
    if (locale === i18n.language) {
        return;
    }

    i18n.changeLanguage(locale);
    axios.post(route('locale.update'), { locale }).catch(() => {
        // Falha silenciosa: o idioma já mudou no cliente; na próxima
        // navegação o servidor volta a resolver a partir da sessão.
    });
}

/**
 * variant "dark" — chip translúcido sobre fundo escuro (landing).
 * variant "light" — chip neutro com suporte a dark mode (áreas
 * autenticadas e páginas de autenticação).
 * compact — botão único que alterna entre os dois idiomas, sem
 * dropdown (usado no menu mobile da landing, onde o dropdown não
 * cabe).
 */
export default function LanguageSwitcher({
    variant = 'light',
    compact = false,
    className = '',
    alignLeftOnMobile = false,
}) {
    const { t, i18n } = useTranslation('common');
    const [aberto, setAberto] = useState(false);

    const idiomaAtual = LOCALES_SUPORTADOS.includes(i18n.language)
        ? i18n.language
        : 'pt';

    if (compact) {
        const proximo = idiomaAtual === 'pt' ? 'en' : 'pt';

        return (
            <button
                type="button"
                onClick={() => trocarIdioma(i18n, proximo)}
                aria-label={t('idioma.seletor')}
                className={
                    className ||
                    'flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:border-[#14B8A6]/50 hover:text-[#14B8A6]'
                }
            >
                <Globe2 size={18} />
                {idiomaAtual.toUpperCase()}
            </button>
        );
    }

    const botaoClasses =
        variant === 'dark'
            ? 'flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-[#14B8A6]/50 hover:bg-white/10'
            : 'flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-teal-500/50 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-teal-400';

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setAberto((valor) => !valor)}
                aria-label={t('idioma.seletor')}
                aria-expanded={aberto}
                className={botaoClasses}
            >
                <Globe2 size={17} />
                <span>{idiomaAtual.toUpperCase()}</span>
                <ChevronDown
                    size={15}
                    className={`transition-transform ${aberto ? 'rotate-180' : ''}`}
                />
            </button>

            {aberto && (
                <div
                    className={`absolute top-12 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 ${
                        alignLeftOnMobile
                            ? 'left-0 sm:left-auto sm:right-0'
                            : 'right-0'
                    }`}
                >
                    {LOCALES_SUPORTADOS.map((locale) => (
                        <button
                            key={locale}
                            type="button"
                            onClick={() => {
                                trocarIdioma(i18n, locale);
                                setAberto(false);
                            }}
                            aria-current={locale === idiomaAtual}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition ${
                                locale === idiomaAtual
                                    ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                    : 'text-slate-800 hover:bg-teal-500/10 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400'
                            }`}
                        >
                            {t(`idioma.${locale}`)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
