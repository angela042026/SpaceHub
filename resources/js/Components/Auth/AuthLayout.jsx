import useTheme from '@/Hooks/useTheme';
import {
    QrCode,
    ShieldCheck,
    Timer,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthFooter from './AuthFooter';
import AuthHeader from './AuthHeader';
import FeatureItem from './FeatureItem';
import ChatWidget from '@/Components/Chat/ChatWidget';

export default function AuthLayout({
    title,
    highlightedTitle,
    subtitle,
    children,
    heroTitle,
    heroPrefix,
    heroHighlightedTitle,
    heroDescription,
    wideForm = false,
}) {
    const { t } = useTranslation('auth');
    const { theme, toggleTheme } = useTheme();

    heroTitle ??= t('layout.heroTituloOmissao');
    heroPrefix ??= t('layout.heroPrefixoOmissao');
    heroHighlightedTitle ??= t('layout.heroTituloDestaqueOmissao');
    heroDescription ??= t('layout.heroDescricaoOmissao');

    const gridColumns = wideForm
        ? 'lg:grid-cols-[590px_1fr]'
        : 'lg:grid-cols-[520px_1fr]';

    const formMaxWidth = wideForm
        ? 'max-w-[520px]'
        : 'max-w-[480px]';

    return (
        <div
            className="
                min-h-screen bg-white
                text-slate-900
                transition-colors duration-300
                dark:bg-[#06172A]
                dark:text-white
            "
        >
            <AuthHeader
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className="relative overflow-hidden">
                <div
                    className="
                        pointer-events-none absolute inset-0
                        bg-[radial-gradient(circle_at_15%_35%,rgba(20,184,166,0.07),transparent_32%)]
                        dark:bg-[radial-gradient(circle_at_15%_35%,rgba(20,184,166,0.14),transparent_34%)]
                    "
                />

                <div
                    className={`
                        relative mx-auto grid
                        min-h-[calc(100vh-6rem-72px)]
                        max-w-[1500px]
                        ${gridColumns}
                    `}
                >
                    {/* Coluna esquerda */}
                    <section
                        className="
                            flex items-center
                            px-5 py-12
                            sm:px-10
                            lg:px-12
                            xl:px-16
                        "
                    >
                        <div
                            className={`
                                mx-auto w-full
                                ${formMaxWidth}
                            `}
                        >
                            <div className="mb-7">
                                <h1
                                    className="
                                        text-3xl font-extrabold
                                        tracking-tight
                                        text-[#102E55]
                                        dark:text-white
                                        sm:text-4xl
                                    "
                                >
                                    {title}{' '}

                                    {highlightedTitle && (
                                        <span className="text-[#14B8A6]">
                                            {highlightedTitle}
                                        </span>
                                    )}
                                </h1>

                                {subtitle && (
                                    <p
                                        className="
                                            mt-3 max-w-md
                                            text-base leading-7
                                            text-slate-600
                                            dark:text-slate-300
                                        "
                                    >
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {children}
                        </div>
                    </section>

                    {/* Coluna direita */}
                    <section className="relative hidden min-h-full overflow-hidden lg:block">
                        <img
                            src="/images/landing/hero-spacehub.jpg"
                            alt={t('layout.imagemAlt')}
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        {/* Camada clara */}
                        <div
                            className="
                                absolute inset-0
                                bg-gradient-to-r
                                from-white/90
                                via-white/15
                                to-white/5
                                transition-opacity duration-300
                                dark:opacity-0
                            "
                        />

                        {/* Camada escura */}
                        <div
                            className="
                                absolute inset-0 opacity-0
                                bg-[linear-gradient(90deg,rgba(6,23,42,0.96)_0%,rgba(6,23,42,0.72)_28%,rgba(6,23,42,0.18)_65%,rgba(6,23,42,0.42)_100%)]
                                transition-opacity duration-300
                                dark:opacity-100
                            "
                        />

                        {/* Gradiente inferior */}
                        <div
                            className="
                                absolute inset-x-0 bottom-0
                                h-[52%]
                                bg-gradient-to-t
                                from-white
                                via-white/75
                                to-transparent
                                dark:from-[#06172A]
                                dark:via-[#06172A]/75
                            "
                        />

                        <div className="absolute inset-x-12 bottom-14 z-10 xl:inset-x-20">
                            <div className="flex max-w-2xl items-start gap-5">
                                <div
                                    className="
                                        flex h-20 w-20 shrink-0
                                        items-center justify-center
                                        rounded-2xl
                                        border border-slate-200
                                        bg-white/90
                                        text-[#14B8A6]
                                        shadow-lg
                                        backdrop-blur
                                        dark:border-[#5EEAD4]/20
                                        dark:bg-[#06213C]/85
                                        dark:text-[#5EEAD4]
                                    "
                                >
                                    <ShieldCheck
                                        size={40}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <div>
                                    <h2
                                        className="
                                            text-3xl font-extrabold
                                            leading-tight
                                            text-[#102E55]
                                            dark:text-white
                                            xl:text-4xl
                                        "
                                    >
                                        {heroTitle}
                                        <br />

                                        {heroPrefix}{' '}

                                        <span className="text-[#14B8A6]">
                                            {heroHighlightedTitle}
                                        </span>
                                    </h2>

                                    <p
                                        className="
                                            mt-4 max-w-xl
                                            text-base leading-7
                                            text-slate-600
                                            dark:text-slate-200
                                        "
                                    >
                                        {heroDescription}
                                    </p>
                                </div>
                            </div>

                            <div
                                className="
                                    mt-7 grid grid-cols-3 gap-5
                                    border-t border-slate-200
                                    pt-6
                                    dark:border-white/15
                                "
                            >
                                <FeatureItem
                                    icon={ShieldCheck}
                                    title={t('layout.featureDadosProtegidos.titulo')}
                                    description={t('layout.featureDadosProtegidos.descricao')}
                                />

                                <FeatureItem
                                    icon={QrCode}
                                    title={t('layout.featureCheckinQr.titulo')}
                                    description={t('layout.featureCheckinQr.descricao')}
                                />

                                <FeatureItem
                                    icon={Timer}
                                    title={t('layout.featureSempreDisponivel.titulo')}
                                    description={t('layout.featureSempreDisponivel.descricao')}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <AuthFooter />

            <ChatWidget />
        </div>
    );
}
