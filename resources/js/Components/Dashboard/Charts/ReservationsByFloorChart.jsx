import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Building2 } from 'lucide-react';

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {payload[0]?.value ?? 0} reservas
            </p>
        </div>
    );
}

export default function ReservationsByFloorChart({
    data = [],
}) {
    const chartData = data.map((item) => ({
        name:
            item.nome ??
            item.piso_nome ??
            item.piso ??
            'Piso',
        total: Number(
            item.total ??
                item.reservas_count ??
                item.reservas ??
                0,
        ),
    }));

    return (
        <section className="dashboard-card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                    <Building2
                        size={20}
                        strokeWidth={1.9}
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Reservas por piso
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                        Distribuição no período atual
                    </p>
                </div>
            </header>

            <div className="p-5">
                {chartData.length > 0 ? (
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    top: 5,
                                    right: 20,
                                    bottom: 5,
                                    left: 0,
                                }}
                            >
                                <CartesianGrid
                                    horizontal={false}
                                    strokeDasharray="4 4"
                                    stroke="rgba(148, 163, 184, 0.15)"
                                />

                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: '#94a3b8',
                                    }}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={70}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: '#64748b',
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: 'rgba(20, 184, 166, 0.05)',
                                    }}
                                    content={<ChartTooltip />}
                                />

                                <Bar
                                    dataKey="total"
                                    fill="#14b8a6"
                                    radius={[0, 8, 8, 0]}
                                    maxBarSize={18}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700">
                        Ainda não existem dados por piso.
                    </div>
                )}
            </div>
        </section>
    );
}
