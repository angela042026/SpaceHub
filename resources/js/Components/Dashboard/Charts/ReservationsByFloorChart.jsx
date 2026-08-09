import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Building2, Info } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const { atual, anterior } = payload[0].payload;
    const variacao =
        anterior > 0
            ? Math.round(((atual - anterior) / anterior) * 1000) / 10
            : null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl dark:border-[#2a5069] dark:bg-[#101f34]">
            <p className="text-xs font-bold text-slate-700 dark:text-[#f8fafc]">
                {label}
            </p>

            <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500 dark:text-[#b5c5d5]">Atual</span>
                    <span className="font-bold text-teal-600 dark:text-[#18c3b3]">
                        {atual}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500 dark:text-[#b5c5d5]">Anterior</span>
                    <span className="font-bold text-blue-500 dark:text-blue-400">
                        {anterior}
                    </span>
                </div>
            </div>

            {variacao !== null && (
                <p
                    className={`mt-2 text-xs font-bold ${
                        variacao >= 0
                            ? 'text-green-500'
                            : 'text-rose-500'
                    }`}
                >
                    {variacao >= 0 ? '+' : ''}
                    {variacao}%
                </p>
            )}
        </div>
    );
}

export default function ReservationsByFloorChart({
    data,
}) {
    const pisos = data?.pisos ?? [];
    const total = data?.total ?? 0;
    const pisoDestaque = data?.pisoDestaque ?? null;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-[#2a5069]">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <Building2
                            size={20}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                            Reservas por piso
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400 dark:text-[#8fa7bd]">
                            Últimos 30 dias
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-lg font-extrabold text-slate-900 dark:text-[#f8fafc]">
                        {total}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8fa7bd]">
                        Reservas
                    </p>
                </div>
            </header>

            <div className="flex flex-1 flex-col justify-between p-5">
                <div className="flex items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500 dark:bg-[#18c3b3]" />
                        Período atual
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        Período anterior
                    </span>
                </div>

                {pisos.length > 0 ? (
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={pisos}
                                margin={{
                                    top: 5,
                                    right: 5,
                                    bottom: 5,
                                    left: -20,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="barraAtualGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#2dd4bf"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#0d9488"
                                        />
                                    </linearGradient>

                                    <linearGradient
                                        id="barraAnteriorGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#60a5fa"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#2563eb"
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="4 4"
                                    stroke="var(--chart-grid)"
                                />

                                <XAxis
                                    dataKey="nome"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: 'var(--chart-axis)',
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: 'var(--chart-axis)',
                                    }}
                                    allowDecimals={false}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: 'rgba(20, 184, 166, 0.05)',
                                    }}
                                    content={<CustomTooltip />}
                                />

                                <Bar
                                    dataKey="atual"
                                    fill="url(#barraAtualGradient)"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                >
                                    <LabelList
                                        dataKey="atual"
                                        position="top"
                                        fontSize={11}
                                        fontWeight={700}
                                        fill="var(--color-text-primary)"
                                    />
                                </Bar>

                                <Bar
                                    dataKey="anterior"
                                    fill="url(#barraAnteriorGradient)"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                >
                                    <LabelList
                                        dataKey="anterior"
                                        position="top"
                                        fontSize={11}
                                        fontWeight={700}
                                        fill="var(--color-text-secondary)"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-[#2a5069] dark:text-[#8fa7bd]">
                        Ainda não existem dados por piso.
                    </div>
                )}

                {pisoDestaque && (
                    <div className="flex items-center gap-2 rounded-xl bg-teal-500/10 px-3.5 py-2.5 text-xs font-semibold text-teal-700 dark:bg-[#18c3b3]/10 dark:text-[#18c3b3]">
                        <Info size={14} strokeWidth={2} />
                        {pisoDestaque.nome} concentra{' '}
                        {pisoDestaque.percentual}% das reservas
                    </div>
                )}
            </div>
        </section>
    );
}
