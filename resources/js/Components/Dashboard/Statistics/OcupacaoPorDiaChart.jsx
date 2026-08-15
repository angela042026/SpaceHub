import {
    Area,
    CartesianGrid,
    ComposedChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Gauge } from 'lucide-react';

/**
 * "Taxa de Ocupação por Dia" — área turquesa com linha de média,
 * alimentada pelos mesmos dados de DashboardMetricsService::
 * obterTendenciaOcupacaoComparativa() usados no dashboard principal,
 * já filtrados ao período escolhido no cabeçalho da página (ao
 * contrário de OccupancyTrendChart, que tem o seu próprio seletor
 * interno de dias).
 */
function OcupacaoTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-700 dark:text-white">{label}</p>

            <p className="mt-1 text-sm font-bold text-teal-600 dark:text-teal-400">
                {payload[0]?.value ?? 0}% de ocupação
            </p>
        </div>
    );
}

export default function OcupacaoPorDiaChart({ data }) {
    const atual = data?.atual ?? [];
    const media = data?.media ?? 0;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <Gauge size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Taxa de Ocupação por Dia
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Secretárias ocupadas / total reservável
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                    Média: {media}%
                </span>
            </header>

            <div className="flex-1 p-4">
                {atual.length > 0 ? (
                    <div className="h-[245px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={atual} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="ocupacaoPorDiaFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.28} />
                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="4 4"
                                    stroke="var(--chart-grid, rgba(148,163,184,0.15))"
                                />

                                <XAxis
                                    dataKey="dia"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'var(--chart-axis, #94a3b8)' }}
                                    interval="preserveStartEnd"
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'var(--chart-axis, #64748b)' }}
                                    domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]}
                                    unit="%"
                                    width={42}
                                />

                                <Tooltip content={<OcupacaoTooltip />} />

                                <ReferenceLine
                                    y={media}
                                    stroke="#0d9488"
                                    strokeDasharray="5 5"
                                    strokeWidth={1.5}
                                    label={{
                                        value: `Média: ${media}%`,
                                        position: 'insideTopRight',
                                        fill: '#0d9488',
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="ocupacao"
                                    stroke="#14b8a6"
                                    strokeWidth={2.25}
                                    fill="url(#ocupacaoPorDiaFill)"
                                    dot={{ r: 2.5, fill: '#14b8a6', strokeWidth: 0 }}
                                    activeDot={{ r: 4 }}
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[245px] items-center justify-center">
                        <p className="text-sm text-slate-400">Sem dados de ocupação neste período.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
