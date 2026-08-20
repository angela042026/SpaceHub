import { useTranslation } from 'react-i18next';
import {
    BarChart3,
    CheckCircle2,
    Clock3,
    Lock,
    QrCode,
} from 'lucide-react';

const highlightIcons = [Clock3, QrCode, BarChart3];

export default function BenefitsSection() {
    const { t } = useTranslation('landing');

    const benefits = t('benefits.itens', { returnObjects: true });

    const highlights = [
        t('benefits.indicadores.acesso', { returnObjects: true }),
        t('benefits.indicadores.processo', { returnObjects: true }),
        t('benefits.indicadores.dados', { returnObjects: true }),
    ].map((item, indice) => ({
        value: item.valor,
        label: item.label,
        icon: highlightIcons[indice],
    }));

    return (
        <section
            id="beneficios"
            className="relative scroll-mt-[74px] overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
            <div className="mx-auto max-w-[1450px]">
                <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                    {/* Conteúdo */}
                    <div>
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                            {t('benefits.eyebrow')}
                        </span>

                        <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-4xl lg:text-5xl">
                            {t('benefits.tituloLinha1')}
                            <br />
                            {t('benefits.tituloLinha2')}
                        </h2>

                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
                            {t('benefits.descricao')}
                        </p>

                        <div className="mt-9 space-y-4">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2
                                        size={21}
                                        className="mt-0.5 shrink-0 text-[#14B8A6]"
                                        strokeWidth={2}
                                    />

                                    <span className="text-sm leading-7 text-slate-700 sm:text-base">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-[#071A33]">
                            <Lock
                                size={20}
                                className="text-[#14B8A6]"
                            />

                            {t('benefits.rgpd')}
                        </div>
                    </div>

                    {/* Imagem */}
                    <div className="relative">
                        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                            <picture>
                                <source
                                    srcSet="/images/landing/dashboard-spacehub.webp"
                                    type="image/webp"
                                />

                                <img
                                    src="/images/landing/dashboard-spacehub.png"
                                    alt={t('benefits.imagemAlt')}
                                    loading="lazy"
                                    className="h-[480px] w-full object-cover object-center lg:h-[590px]"
                                />
                            </picture>
                        </div>

                        {/* Indicadores */}
                        <div className="relative z-10 mx-5 -mt-16 grid gap-3 sm:mx-8 sm:grid-cols-3">
                            {highlights.map(
                                ({
                                    value,
                                    label,
                                    icon: Icon,
                                }) => (
                                    <article
                                        key={label}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.10)]"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <span className="block text-xl font-black text-[#071A33]">
                                                    {value}
                                                </span>

                                                <span className="mt-1 block text-xs font-semibold text-slate-500">
                                                    {label}
                                                </span>
                                            </div>

                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#14B8A6]/10 text-[#14B8A6]">
                                                <Icon
                                                    size={20}
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
