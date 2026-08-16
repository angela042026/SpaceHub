import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Armchair,
    BarChart3,
    Building2,
    History,
    Layers,
    LayoutGrid,
    Lock,
    Map,
    MapPin,
    MessageSquare,
    ShieldCheck,
    Users,
} from 'lucide-react';

const gestaoFluxoIcons = [Building2, Layers, LayoutGrid, Armchair, Users];

// Uma onda por cartão (viewBox 400x170) em vez de um retângulo com
// cantos arredondados — o fundo tem de se misturar com o cartão, não
// parecer outro cartão lá dentro. As três curvas variam só o
// suficiente para não parecerem repetidas, e ultrapassam ligeiramente
// os 145px da linha da grelha para "derreter" sobre o título.
const ondas = [
    'M0,0 H400 V115 C330,150 300,105 230,125 C160,145 90,100 0,130 Z',
    'M0,0 H400 V130 C340,100 280,150 210,120 C140,90 80,140 0,110 Z',
    'M0,0 H400 V120 C320,145 260,100 190,135 C120,170 60,110 0,140 Z',
];

function FundoOrganico({ indice }) {
    const gradId = `funcionalidade-onda-${indice}`;

    return (
        <svg
            viewBox="0 0 400 170"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-[165px] w-full"
        >
            <defs>
                <linearGradient
                    id={gradId}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop offset="0%" stopColor="#F5FAFF" />
                    <stop offset="100%" stopColor="#EAFBF8" />
                </linearGradient>
            </defs>

            <path
                d={ondas[indice % ondas.length]}
                fill={`url(#${gradId})`}
            />
        </svg>
    );
}

function CardFeature({ indice, icon: Icon, title, description, children }) {
    return (
        <article className="group grid h-auto min-h-[315px] grid-rows-[145px_auto_auto] gap-2 overflow-hidden rounded-[22px] border border-[rgba(15,42,61,0.07)] bg-white p-[22px] shadow-[0_12px_35px_rgba(15,42,61,0.08)] transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(15,42,61,0.12)] sm:h-[315px] sm:min-h-0">
            <div className="relative">
                <FundoOrganico indice={indice} />
                {children}
            </div>

            <div className="flex items-center gap-2">
                <Icon
                    size={20}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#14B8A6]"
                />

                <h3 className="text-[18px] font-bold leading-tight text-[#071A33]">
                    {title}
                </h3>
            </div>

            <p className="text-sm leading-relaxed text-slate-500">
                {description}
            </p>
        </article>
    );
}

export default function FeaturesSection() {
    const { t } = useTranslation('landing');

    const historico = [
        { data: '12 Mai 2024', hora: '09:00 \u2013 12:00', estado: t('features.historico.concluida') },
        { data: '8 Mai 2024', hora: '14:00 \u2013 17:00', estado: t('features.historico.cancelada') },
        { data: '2 Mai 2024', hora: '09:00 \u2013 11:00', estado: t('features.historico.concluida') },
    ];

    const gestaoFluxo = [
        t('features.gestao.edificio'),
        t('features.gestao.piso'),
        t('features.gestao.setor'),
        t('features.gestao.secretaria'),
        t('features.gestao.utilizadores'),
    ].map((label, indice) => ({ label, icon: gestaoFluxoIcons[indice] }));

    const acessos = [
        t('features.seguranca.acessoAdmin'),
        t('features.seguranca.acessoUtilizador'),
    ];

    return (
        <section
            id="funcionalidades"
            className="scroll-mt-[100px] bg-white px-6 pb-14 pt-16 lg:px-10 lg:pb-16 lg:pt-20"
        >
            <div className="mx-auto w-full max-w-[1320px]">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                        {t('features.eyebrow')}
                    </span>

                    <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-5xl lg:whitespace-nowrap">
                        {t('features.titulo')}
                    </h2>

                    <p className="mx-auto mt-[10px] max-w-2xl text-base leading-8 text-slate-600">
                        {t('features.descricao')}
                    </p>
                </div>

                <div className="mx-auto mt-[38px] grid w-[calc(100%-24px)] max-w-[1320px] gap-6 sm:w-[calc(100%-48px)] sm:grid-cols-2 lg:grid-cols-3">
                    <CardFeature
                        indice={0}
                        icon={Map}
                        title={t('features.mapa.titulo')}
                        description={t('features.mapa.descricao')}
                    >
                        <div className="absolute inset-3 z-10 overflow-hidden rounded-[14px] shadow-[0_6px_16px_rgba(15,42,61,0.15)]">
                            <img
                                src="/images/maps/Piso0.png"
                                alt={t('features.mapa.imagemAlt')}
                                loading="lazy"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>

                        <div className="absolute left-[52%] top-[64%] z-20 -translate-x-1/2 -translate-y-[88%]">
                            <MapPin
                                size={26}
                                strokeWidth={1.5}
                                fill="#14B8A6"
                                className="text-[#14B8A6] drop-shadow-[0_2px_4px_rgba(15,23,42,0.35)]"
                            />

                            <span className="absolute left-1/2 top-[7px] flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[7px] font-bold text-slate-700">
                                10
                            </span>
                        </div>
                    </CardFeature>

                    <CardFeature
                        indice={1}
                        icon={History}
                        title={t('features.historico.titulo')}
                        description={t('features.historico.descricao')}
                    >
                        <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-4">
                            {historico.map((item) => (
                                <div
                                    key={item.data}
                                    className="flex items-center gap-2 text-[11px]"
                                >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14B8A6]" />

                                    <span className="w-[72px] shrink-0 whitespace-nowrap font-semibold text-[#071A33]">
                                        {item.data}
                                    </span>

                                    <span className="flex-1 truncate text-slate-400">
                                        {item.hora}
                                    </span>

                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                            item.estado === t('features.historico.concluida')
                                                ? 'bg-emerald-100/70 text-emerald-600'
                                                : 'bg-red-100/70 text-red-500'
                                        }`}
                                    >
                                        {item.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardFeature>

                    <CardFeature
                        indice={2}
                        icon={BarChart3}
                        title={t('features.estatisticas.titulo')}
                        description={t('features.estatisticas.descricao')}
                    >
                        <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-[9px] font-semibold text-slate-400">
                                        {t('features.estatisticas.utilizacaoMedia')}
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-[#071A33]">
                                        72%
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[9px] font-semibold text-slate-400">
                                        {t('features.estatisticas.reservas')}
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-[#071A33]">
                                        1.248
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[9px] font-semibold text-slate-400">
                                        {t('features.estatisticas.espacosAtivos')}
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-[#071A33]">
                                        83
                                    </p>
                                </div>
                            </div>

                            <svg
                                viewBox="0 0 200 40"
                                className="h-8 w-full"
                                preserveAspectRatio="none"
                            >
                                <polyline
                                    points="0,32 25,26 50,29 75,16 100,21 125,10 150,15 175,4 200,9"
                                    fill="none"
                                    stroke="#14B8A6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </CardFeature>

                    <CardFeature
                        indice={0}
                        icon={Building2}
                        title={t('features.gestao.titulo')}
                        description={t('features.gestao.descricao')}
                    >
                        <div className="relative z-10 flex h-full items-center justify-center gap-1 px-2">
                            {gestaoFluxo.map((item, indice) => (
                                <Fragment key={item.label}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#14B8A6]/40 bg-white/70 text-[#14B8A6]">
                                            <item.icon
                                                size={14}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <span className="text-[7.5px] font-semibold text-slate-500">
                                            {item.label}
                                        </span>
                                    </div>

                                    {indice <
                                        gestaoFluxo.length - 1 && (
                                        <div className="mb-4 h-px w-2 border-t border-dashed border-[#14B8A6]/40" />
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    </CardFeature>

                    <CardFeature
                        indice={1}
                        icon={ShieldCheck}
                        title={t('features.seguranca.titulo')}
                        description={t('features.seguranca.descricao')}
                    >
                        <div className="relative z-10 flex h-full items-center gap-3 px-4">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#071A33] text-[#14B8A6]">
                                <Lock size={24} strokeWidth={1.6} />
                            </div>

                            <div className="flex-1 space-y-1.5">
                                {acessos.map((acesso) => (
                                    <div
                                        key={acesso}
                                        className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2 py-1.5"
                                    >
                                        <span className="text-[9px] font-semibold leading-tight text-slate-600">
                                            {acesso}
                                        </span>

                                        <span className="relative h-3.5 w-6 shrink-0 rounded-full bg-[#14B8A6]">
                                            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardFeature>

                    <CardFeature
                        indice={2}
                        icon={MessageSquare}
                        title={t('features.suporte.titulo')}
                        description={t('features.suporte.descricao')}
                    >
                        <div className="relative z-10 flex h-full flex-col justify-center gap-1.5 px-4">
                            <div className="flex items-end gap-1.5">
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[8px] font-bold text-slate-600 shadow-sm">
                                    SH
                                </span>

                                <div className="rounded-xl rounded-bl-sm bg-white px-2.5 py-1 text-[9px] font-medium text-slate-700 shadow-sm">
                                    {t('features.suporte.mensagemBot')}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="rounded-xl rounded-br-sm bg-[#14B8A6] px-2.5 py-1 text-[9px] font-medium text-white shadow-sm">
                                    {t('features.suporte.mensagemUtilizador')}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-bold text-emerald-600">
                                    {t('features.suporte.online')}
                                </span>
                            </div>
                        </div>
                    </CardFeature>
                </div>
            </div>
        </section>
    );
}
