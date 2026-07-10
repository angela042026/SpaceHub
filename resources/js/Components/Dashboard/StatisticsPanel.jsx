import { router } from '@inertiajs/react';

import {
    Armchair,
    Award,
    BarChart3,
    CalendarDays,
    ChevronDown,
    Crown,
    Medal,
    TrendingDown,
    TrendingUp,
    Trophy,
    UserRound,
} from 'lucide-react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const RANKING_ICONS = [
    {
        icon: Crown,
        containerClass:
            'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20',
    },
    {
        icon: Medal,
        containerClass:
            'bg-slate-400/10 text-slate-500 ring-1 ring-slate-400/20',
    },
    {
        icon: Award,
        containerClass:
            'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20',
    },
];

const CHART_COLORS = {
    teal: '#14b8a6',
    navy: '#1e3a5f',
    slate: '#64748b',
};

function formatarData(data) {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
    });
}

function obterPercentagem(valor, maximo) {
    const total = Number(valor ?? 0);
    const maior = Number(maximo ?? 0);

    if (maior <= 0) {
        return 0;
    }

    return Math.round((total / maior) * 100);
}

function EmptyState({ text }) {
    return (
        <div className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <BarChart3 size={23} strokeWidth={1.8} />
            </div>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                {text}
            </p>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {payload[0]?.value ?? 0} reservas
            </p>
        </div>
    );
}

function PremiumChart({
    data,
    color,
    gradientId,
}) {
    if (!data?.length) {
        return null;
    }

    return (
        <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 6,
                        right: 14,
                        bottom: 6,
                        left: 4,
                    }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop
                                offset="0%"
                                stopColor={color}
                                stopOpacity={0.55}
                            />
                            <stop
                                offset="100%"
                                stopColor={color}
                                stopOpacity={1}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        horizontal={false}
                        strokeDasharray="4 4"
                        stroke="rgba(148, 163, 184, 0.12)"
                    />

                    <XAxis
                        type="number"
                        hide
                    />

                    <YAxis
                        type="category"
                        dataKey="name"
                        width={92}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 11,
                            fill: '#94a3b8',
                        }}
                        tickFormatter={(value) => {
                            const texto = String(value ?? '');

                            if (texto.length > 13) {
                                return `${texto.slice(0, 12)}…`;
                            }

                            return texto;
                        }}
                    />

                    <Tooltip
                        cursor={{
                            fill: 'rgba(148, 163, 184, 0.08)',
                        }}
                        content={<CustomTooltip />}
                    />

                    <Bar
                        dataKey="total"
                        radius={[0, 10, 10, 0]}
                        fill={`url(#${gradientId})`}
                        maxBarSize={18}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function RankingPosition({ index }) {
    const config = RANKING_ICONS[index];

    if (!config) {
        return (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {index + 1}
            </div>
        );
    }

    const Icon = config.icon;

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.containerClass}`}
        >
            <Icon size={17} strokeWidth={2} />
        </div>
    );
}

function RankingItem({
    item,
    index,
    title,
    subtitle,
    total,
    maxTotal,
    colorClass,
}) {
    const percentagem = obterPercentagem(total, maxTotal);

    return (
        <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/20 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900">
            <div className="flex items-center gap-3">
                <RankingPosition index={index} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                                {title}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                {subtitle}
                            </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                            {total}
                        </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                            style={{
                                width: `${percentagem}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function RankingSection({
    title,
    description,
    icon: Icon,
    items,
    chartData,
    chartColor,
    gradientId,
    getKey,
    getTitle,
    getSubtitle,
    getTotal,
    progressClass,
}) {
    const totais =
        items?.map((item) => Number(getTotal(item) ?? 0)) ?? [];

    const maxTotal =
        totais.length > 0
            ? Math.max(...totais)
            : 0;

    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-card">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <Icon size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {title}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {items?.length > 0 ? (
                    <>
                        <PremiumChart
                            data={chartData}
                            color={chartColor}
                            gradientId={gradientId}
                        />

                        <div className="mt-4 space-y-2.5">
                            {items.map((item, index) => (
                                <RankingItem
                                    key={getKey(item, index)}
                                    item={item}
                                    index={index}
                                    title={getTitle(item)}
                                    subtitle={getSubtitle(item)}
                                    total={getTotal(item)}
                                    maxTotal={maxTotal}
                                    colorClass={progressClass}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState text="Ainda não existem dados suficientes para apresentar este ranking." />
                )}
            </div>
        </section>
    );
}

export default function StatisticsPanel({
    estatisticas,
    periodo = 'geral',
}) {
    function mudarPeriodo(event) {
        router.get(
            route('dashboard'),
            {
                periodo: event.target.value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['estatisticas', 'periodo'],
            },
        );
    }

    const secretariasMaisChart =
        estatisticas?.secretariasMaisUtilizadas?.map((item) => ({
            name: item.secretaria?.codigo ?? '—',
            total: item.total,
        })) ?? [];

    const secretariasMenosChart =
        estatisticas?.secretariasMenosUtilizadas?.map((item) => ({
            name: item.codigo ?? '—',
            total: item.reservas_count,
        })) ?? [];

    const utilizadoresChart =
        estatisticas?.utilizadoresComMaisReservas?.map((item) => ({
            name: item.user?.name ?? '—',
            total: item.total,
        })) ?? [];

    const diasChart =
        estatisticas?.diasComMaiorOcupacao?.map((item) => ({
            name: formatarData(item.data),
            total: item.total,
        })) ?? [];

    const pisoMaisUtilizado =
        estatisticas?.pisoMaisUtilizado;

    const totalPiso =
        Number(pisoMaisUtilizado?.total ?? 0);

    return (
        <section className="dashboard-card overflow-hidden">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <BarChart3 size={24} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Estatísticas de Ocupação
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Análise do uso dos espaços e das reservas.
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-[210px]">
                    <CalendarDays
                        size={17}
                        strokeWidth={1.9}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-500"
                    />

                    <select
                        value={periodo}
                        onChange={mudarPeriodo}
                        aria-label="Selecionar período das estatísticas"
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/40 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="geral">
                            Geral
                        </option>

                        <option value="semana">
                            Esta semana
                        </option>

                        <option value="mes">
                            Este mês
                        </option>
                    </select>

                    <ChevronDown
                        size={17}
                        strokeWidth={1.9}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-6 p-6">
                {/* Piso em destaque */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 p-6 text-white shadow-xl">
                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/15 blur-2xl" />

                    <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10 backdrop-blur-sm">
                                <Trophy size={27} strokeWidth={1.8} />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                                    Piso em destaque
                                </p>

                                <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
                                    {pisoMaisUtilizado?.nome ?? 'Sem dados'}
                                </h3>

                                <p className="mt-2 text-sm text-slate-300">
                                    Piso com maior número de reservas no período selecionado.
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-[190px] items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/10 backdrop-blur-md">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                                <TrendingUp size={21} strokeWidth={2} />
                            </div>

                            <div>
                                <p className="text-xs text-slate-300">
                                    Total de reservas
                                </p>

                                <p className="mt-0.5 text-2xl font-extrabold">
                                    {totalPiso}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rankings */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RankingSection
                        title="Secretárias mais utilizadas"
                        description="Postos com maior número de reservas"
                        icon={TrendingUp}
                        items={estatisticas?.secretariasMaisUtilizadas}
                        chartData={secretariasMaisChart}
                        chartColor={CHART_COLORS.teal}
                        gradientId="gradient-secretarias-mais"
                        getKey={(item) => item.secretaria_id}
                        getTitle={(item) =>
                            item.secretaria?.codigo ??
                            'Secretária removida'
                        }
                        getSubtitle={(item) =>
                            `${item.total ?? 0} reservas registadas`
                        }
                        getTotal={(item) => item.total}
                        progressClass="bg-gradient-to-r from-teal-400 to-teal-500"
                    />

                    <RankingSection
                        title="Secretárias menos utilizadas"
                        description="Postos com menor procura"
                        icon={TrendingDown}
                        items={estatisticas?.secretariasMenosUtilizadas}
                        chartData={secretariasMenosChart}
                        chartColor={CHART_COLORS.slate}
                        gradientId="gradient-secretarias-menos"
                        getKey={(item) => item.id}
                        getTitle={(item) =>
                            item.codigo ?? 'Secretária removida'
                        }
                        getSubtitle={(item) =>
                            `${item.reservas_count ?? 0} reservas registadas`
                        }
                        getTotal={(item) => item.reservas_count}
                        progressClass="bg-gradient-to-r from-slate-400 to-slate-500"
                    />

                    <RankingSection
                        title="Utilizadores com mais reservas"
                        description="Colaboradores mais ativos"
                        icon={UserRound}
                        items={estatisticas?.utilizadoresComMaisReservas}
                        chartData={utilizadoresChart}
                        chartColor={CHART_COLORS.navy}
                        gradientId="gradient-utilizadores"
                        getKey={(item) => item.user_id}
                        getTitle={(item) =>
                            item.user?.name ??
                            'Utilizador removido'
                        }
                        getSubtitle={(item) =>
                            `${item.total ?? 0} reservas registadas`
                        }
                        getTotal={(item) => item.total}
                        progressClass="bg-gradient-to-r from-navy-800 to-navy-900"
                    />

                    <RankingSection
                        title="Dias com maior ocupação"
                        description="Datas com maior atividade"
                        icon={CalendarDays}
                        items={estatisticas?.diasComMaiorOcupacao}
                        chartData={diasChart}
                        chartColor={CHART_COLORS.navy}
                        gradientId="gradient-dias"
                        getKey={(item) => item.data}
                        getTitle={(item) =>
                            formatarData(item.data)
                        }
                        getSubtitle={(item) =>
                            `${item.total ?? 0} reservas registadas`
                        }
                        getTotal={(item) => item.total}
                        progressClass="bg-gradient-to-r from-navy-800 to-teal-500"
                    />
                </div>
            </div>
        </section>
    );
}
