import {
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Minus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COLOR_STYLES = {
    turquesa: {
        line: 'bg-[#18B9AA]',
        iconBg: 'bg-[#18B9AA]/10',
        iconText: 'text-[#18B9AA]',
        iconHoverBg: 'group-hover:bg-[#18B9AA]',
        accent: 'text-[#18B9AA]',
        glow: 'shadow-[#18B9AA]/20',
    },

    turquesaAzulada: {
        line: 'bg-[#13ADC0]',
        iconBg: 'bg-[#13ADC0]/10',
        iconText: 'text-[#13ADC0]',
        iconHoverBg: 'group-hover:bg-[#13ADC0]',
        accent: 'text-[#13ADC0]',
        glow: 'shadow-[#13ADC0]/20',
    },

    cianoAzul: {
        line: 'bg-[#159FD0]',
        iconBg: 'bg-[#159FD0]/10',
        iconText: 'text-[#159FD0]',
        iconHoverBg: 'group-hover:bg-[#159FD0]',
        accent: 'text-[#159FD0]',
        glow: 'shadow-[#159FD0]/20',
    },

    azulClaro: {
        line: 'bg-[#248CCA]',
        iconBg: 'bg-[#248CCA]/10',
        iconText: 'text-[#248CCA]',
        iconHoverBg: 'group-hover:bg-[#248CCA]',
        accent: 'text-[#248CCA]',
        glow: 'shadow-[#248CCA]/20',
    },

    azulMedio: {
        line: 'bg-[#3478B7]',
        iconBg: 'bg-[#3478B7]/10',
        iconText: 'text-[#3478B7]',
        iconHoverBg: 'group-hover:bg-[#3478B7]',
        accent: 'text-[#3478B7]',
        glow: 'shadow-[#3478B7]/20',
    },

    azulMarinho: {
        line: 'bg-[#315F8F]',
        iconBg: 'bg-[#315F8F]/10',
        iconText: 'text-[#315F8F]',
        iconHoverBg: 'group-hover:bg-[#315F8F]',
        accent: 'text-[#315F8F]',
        glow: 'shadow-[#315F8F]/20',
    },
};

/* =========================================================
   RESERVAS HOJE
========================================================= */

function Sparkline({ className }) {
    return (
        <svg
            viewBox="0 0 100 40"
            className={`h-7 w-[56px] ${className}`}
            fill="none"
        >
            <path
                d="
                    M2 29
                    C14 18, 24 8, 38 14
                    C49 19, 56 29, 69 24
                    C81 18, 89 12, 98 16
                "
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="
                    M2 29
                    C14 18, 24 8, 38 14
                    C49 19, 56 29, 69 24
                    C81 18, 89 12, 98 16
                    L98 40
                    L2 40
                    Z
                "
                fill="currentColor"
                opacity="0.09"
            />
        </svg>
    );
}

/* =========================================================
   CHECK-INS
========================================================= */

function MiniSemiGauge({
    className,
    percentual = 0,
}) {
    const value = Math.max(
        0,
        Math.min(100, Number(percentual) || 0),
    );

    const radius = 18;
    const circumference = Math.PI * radius;

    const offset =
        circumference -
        (value / 100) * circumference;

    return (
        <div className="relative flex h-7 w-[56px] items-end justify-center">
            <svg
                viewBox="0 0 48 28"
                className={`h-6 w-[52px] ${className}`}
            >
                <path
                    d="M6 24 A18 18 0 0 1 42 24"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                <path
                    d="M6 24 A18 18 0 0 1 42 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>

            <span
                className={`absolute bottom-[1px] text-[8px] font-extrabold ${className}`}
            >
                {Math.round(value)}%
            </span>
        </div>
    );
}

/* =========================================================
   SECRETÁRIAS LIVRES
========================================================= */

function MiniColumns({ className }) {
    const bars = [
        { y: 27, height: 9, opacity: 0.28 },
        { y: 22, height: 14, opacity: 0.4 },
        { y: 17, height: 19, opacity: 0.52 },
        { y: 12, height: 24, opacity: 0.65 },
        { y: 7, height: 29, opacity: 0.8 },
        { y: 3, height: 33, opacity: 1 },
    ];

    return (
        <svg
            viewBox="0 0 72 40"
            className={`h-7 w-[56px] ${className}`}
        >
            {bars.map((bar, index) => (
                <rect
                    key={index}
                    x={4 + index * 11}
                    y={bar.y}
                    width="7"
                    height={bar.height}
                    rx="3.5"
                    fill="currentColor"
                    opacity={bar.opacity}
                />
            ))}
        </svg>
    );
}

/* =========================================================
   TAXA DE OCUPAÇÃO
========================================================= */

function MiniRing({
    className,
    percentual = 0,
}) {
    const radius = 15;
    const circumference = 2 * Math.PI * radius;

    const value = Math.max(
        0,
        Math.min(100, Number(percentual) || 0),
    );

    const offset =
        circumference -
        (value / 100) * circumference;

    return (
        <div className="relative flex h-9 w-9 items-center justify-center">
            <svg
                viewBox="0 0 36 36"
                className={`h-9 w-9 -rotate-90 ${className}`}
            >
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="4"
                />

                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>

            <span
                className={`absolute text-[8px] font-extrabold ${className}`}
            >
                {Math.round(value)}%
            </span>
        </div>
    );
}

/* =========================================================
   RESERVAS EXPIRADAS
========================================================= */

function MiniExpired({
    className,
    value = 0,
}) {
    const numericValue =
        Number(
            String(value)
                .replace('%', '')
                .replace(',', '.'),
        ) || 0;

    if (numericValue === 0) {
        return (
            <svg
                viewBox="0 0 72 40"
                className={`h-7 w-[56px] ${className}`}
                fill="none"
            >
                <path
                    d="M5 24 H67"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.28"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 72 40"
            className={`h-7 w-[56px] ${className}`}
            fill="none"
        >
            <path
                d="
                    M4 27
                    C13 24, 18 14, 28 17
                    C38 20, 44 28, 53 22
                    C60 18, 64 13, 68 15
                "
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="
                    M4 27
                    C13 24, 18 14, 28 17
                    C38 20, 44 28, 53 22
                    C60 18, 64 13, 68 15
                    L68 36
                    L4 36
                    Z
                "
                fill="currentColor"
                opacity="0.07"
            />

            <circle
                cx="68"
                cy="15"
                r="2.6"
                fill="currentColor"
            />
        </svg>
    );
}

/* =========================================================
   CANCELAMENTOS
   Step chart para ficar diferente da sparkline
========================================================= */

function MiniCancelSteps({ className }) {
    return (
        <svg
            viewBox="0 0 72 40"
            className={`h-7 w-[56px] ${className}`}
            fill="none"
        >
            <path
                d="
                    M4 10
                    H17
                    V15
                    H29
                    V20
                    H42
                    V25
                    H55
                    V29
                    H68
                "
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="
                    M4 10
                    H17
                    V15
                    H29
                    V20
                    H42
                    V25
                    H55
                    V29
                    H68
                    V36
                    H4
                    Z
                "
                fill="currentColor"
                opacity="0.07"
            />

            <circle
                cx="68"
                cy="29"
                r="2.7"
                fill="currentColor"
            />
        </svg>
    );
}

/* =========================================================
   DECORAÇÃO
========================================================= */

function CardDecoration({
    type,
    className,
    percentual,
    value,
}) {
    switch (type) {
        case 'semiGauge':
            return (
                <MiniSemiGauge
                    className={className}
                    percentual={percentual}
                />
            );

        case 'colunas':
            return (
                <MiniColumns
                    className={className}
                />
            );

        case 'anel':
            return (
                <MiniRing
                    className={className}
                    percentual={percentual}
                />
            );

        case 'expired':
            return (
                <MiniExpired
                    className={className}
                    value={value}
                />
            );

        case 'cancelSteps':
            return (
                <MiniCancelSteps
                    className={className}
                />
            );

        case 'onda':
        default:
            return (
                <Sparkline
                    className={className}
                />
            );
    }
}

/* =========================================================
   STAT CARD
========================================================= */

export default function StatCard({
    title,
    subtitulo,
    value,
    icon: Icon,
    changePercent,
    color = 'turquesa',
    decoracao = 'onda',
    ringPercentual,
    invertido = false,
    semMeta = false,
    mensagemZero,
    textoTendencia,
}) {
    const { t, i18n } = useTranslation('dashboard');

    const estilo =
        COLOR_STYLES[color] ??
        COLOR_STYLES.turquesa;

    const hasChange =
        changePercent !== null &&
        changePercent !== undefined;

    const numericChange =
        Number(changePercent);

    const isNegative =
        hasChange && numericChange < 0;

    const isPositive =
        hasChange && numericChange > 0;

    const numericValue =
        Number(
            String(value)
                .replace('%', '')
                .replace(',', '.'),
        ) || 0;

    // Para métricas onde menos é melhor (ex: cancelamentos, expiradas),
    // um valor de zero é sempre um bom resultado — não faz sentido
    // mostrar "-100% vs ontem" a vermelho nem forçar um gráfico vazio.
    const estadoZeroPositivo =
        invertido && numericValue === 0;

    let changeText = t('statCard.semDadosOntem');

    if (hasChange) {
        const signal =
            numericChange > 0
                ? '+'
                : numericChange < 0
                    ? '−'
                    : '';

        const localeNumerico =
            i18n.language === 'en'
                ? 'en-GB'
                : 'pt-PT';

        const numeroFormatado = Math.abs(
            numericChange,
        ).toLocaleString(localeNumerico, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        });

        changeText = t('statCard.vsOntem', {
            signal,
            valor: numeroFormatado,
        });
    }

    // Cor da tendência: por omissão, subir é bom (verde) e descer é mau
    // (vermelho). Em métricas invertidas (menos é melhor) a semântica
    // troca. Quando não existe uma meta definida (ex: taxa de ocupação),
    // nenhuma das direções é claramente boa ou má — usa-se âmbar.
    let changeColor =
        'text-slate-400 dark:text-[#8fa7bd]';

    if (semMeta) {
        if (isPositive || isNegative) {
            changeColor =
                'text-amber-500 dark:text-[#f5a524]';
        }
    } else {
        const tendenciaBoa =
            invertido
                ? isNegative
                : isPositive;

        const tendenciaMa =
            invertido
                ? isPositive
                : isNegative;

        if (tendenciaMa) {
            changeColor =
                'text-rose-500 dark:text-[#ff4d6d]';
        } else if (tendenciaBoa) {
            changeColor =
                'text-emerald-500 dark:text-[#22c983]';
        }
    }

    const percentualDecoracao =
        decoracao === 'anel' ||
        decoracao === 'semiGauge'
            ? ringPercentual ??
              parseFloat(
                  String(value)
                      .replace('%', '')
                      .replace(',', '.'),
              )
            : null;

    return (
        <div
            className="
                group
                relative
                min-h-[124px]
                overflow-hidden
                rounded-[24px]
                border
                border-slate-200/80
                bg-white
                px-5
                py-4

                shadow-[0_8px_30px_rgba(15,23,42,0.045)]

                transition-all
                duration-300
                ease-out

                hover:-translate-y-[3px]
                hover:border-slate-300/80
                hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)]

                dark:border-[#2a5069]
                dark:bg-[#163a56]
                dark:hover:border-[#36566f]

                sm:px-6
            "
        >
            {/* Barra lateral */}
            <span
                className={`
                    absolute
                    bottom-2
                    left-0
                    top-2
                    w-[5px]
                    rounded-r-full
                    ${estilo.line}
                `}
            />

            <div className="flex h-full flex-col justify-between">
                {/* Topo */}
                <div>
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div
                                className={`
                                    relative
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl

                                    transition-all
                                    duration-300

                                    ${estilo.iconBg}
                                    ${estilo.iconText}

                                    group-hover:scale-[1.06]
                                    group-hover:text-white
                                    group-hover:shadow-lg

                                    ${estilo.iconHoverBg}
                                    ${estilo.glow}
                                `}
                            >
                                <div
                                    className={`
                                        absolute
                                        inset-0
                                        -z-10
                                        rounded-xl
                                        opacity-0
                                        blur-xl

                                        transition-opacity
                                        duration-300

                                        group-hover:opacity-50

                                        ${estilo.line}
                                    `}
                                />

                                <Icon
                                    size={17}
                                    strokeWidth={2}
                                />
                            </div>
                        )}

                        <p
                            className="
                                min-w-0
                                truncate
                                text-[12px]
                                font-bold
                                uppercase
                                tracking-[0.045em]
                                text-slate-600
                                dark:text-[#b5c5d5]
                            "
                        >
                            {title}
                        </p>
                    </div>

                    {subtitulo && (
                        <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#8fa7bd]">
                            {subtitulo}
                        </p>
                    )}

                    {/* Valor */}
                    <h3
                        className="
                            mt-2
                            truncate
                            text-[34px]
                            font-extrabold
                            leading-none
                            tracking-[-0.04em]
                            text-slate-950
                            dark:text-[#f8fafc]
                            sm:text-[36px]
                        "
                    >
                        {value}
                    </h3>
                </div>

                {/* Rodapé */}
                <div>
                    <div
                        className="
                            mb-2
                            mt-2
                            h-px
                            w-full
                            bg-slate-100
                            dark:bg-[#2a5069]
                        "
                    />

                    {estadoZeroPositivo ? (
                        <div
                            className="
                                flex
                                min-h-[32px]
                                items-center
                                justify-between
                                gap-4
                            "
                        >
                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-1.5
                                "
                            >
                                <CheckCircle2
                                    size={16}
                                    strokeWidth={2.4}
                                    className="shrink-0 text-emerald-500 dark:text-[#22c983]"
                                />

                                <span
                                    className="
                                        truncate
                                        text-[12px]
                                        font-semibold
                                        text-emerald-500
                                    "
                                >
                                    {mensagemZero ??
                                        t('statCard.semOcorrenciasHoje')}
                                </span>
                            </div>

                            <div className="shrink-0">
                                <CardDecoration
                                    type={decoracao}
                                    className={
                                        estilo.accent
                                    }
                                    percentual={
                                        percentualDecoracao
                                    }
                                    value={value}
                                />
                            </div>
                        </div>
                    ) : textoTendencia ? (
                        <div
                            className="
                                flex
                                min-h-[32px]
                                items-center
                                justify-between
                                gap-4
                            "
                        >
                            <span
                                className="
                                    truncate
                                    text-[12px]
                                    font-semibold
                                    text-slate-500
                                    dark:text-[#8fa7bd]
                                "
                            >
                                {textoTendencia}
                            </span>

                            <div className="shrink-0">
                                <CardDecoration
                                    type={decoracao}
                                    className={
                                        estilo.accent
                                    }
                                    percentual={
                                        percentualDecoracao
                                    }
                                    value={value}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className="
                                flex
                                min-h-[32px]
                                items-center
                                justify-between
                                gap-4
                            "
                        >
                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-1.5
                                "
                            >
                                {isPositive && (
                                    <ArrowUpRight
                                        size={14}
                                        strokeWidth={2.4}
                                        className={`shrink-0 ${changeColor}`}
                                    />
                                )}

                                {isNegative && (
                                    <ArrowDownRight
                                        size={14}
                                        strokeWidth={2.4}
                                        className={`shrink-0 ${changeColor}`}
                                    />
                                )}

                                {!isPositive &&
                                    !isNegative && (
                                        <Minus
                                            size={14}
                                            strokeWidth={2.4}
                                            className="shrink-0 text-slate-400 dark:text-[#8fa7bd]"
                                        />
                                    )}

                                <span
                                    className={`
                                        truncate
                                        text-[12px]
                                        font-semibold
                                        ${changeColor}
                                    `}
                                >
                                    {changeText}
                                </span>
                            </div>

                            <div className="shrink-0">
                                <CardDecoration
                                    type={decoracao}
                                    className={
                                        estilo.accent
                                    }
                                    percentual={
                                        percentualDecoracao
                                    }
                                    value={value}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}