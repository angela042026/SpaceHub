import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = {
    livre: '#14b8a6',
    reservada: '#3b82f6',
    ocupada: '#f43f5e',
};

const LABELS = {
    livre: 'Livres',
    reservada: 'Reservadas',
    ocupada: 'Ocupadas',
};

function DonutTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500">
                {item.name}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {item.value} secretárias
            </p>
        </div>
    );
}

export default function OccupancyDonutChart({ data }) {
    const chartData = [
        {
            key: 'livre',
            name: LABELS.livre,
            value: Number(data?.livre ?? 0),
        },
        {
            key: 'reservada',
            name: LABELS.reservada,
            value: Number(data?.reservada ?? 0),
        },
        {
            key: 'ocupada',
            name: LABELS.ocupada,
            value: Number(data?.ocupada ?? 0),
        },
    ];

    const totalSecretarias = chartData.reduce(
        (total, item) => total + item.value,
        0,
    );

    /*
     * A percentagem central tem de vir sempre dos mesmos 3 números que a
     * legenda mostra — nunca de uma métrica calculada à parte (ex:
     * stats.taxaOcupacao, que usa uma janela horária diferente), senão o
     * donut e a legenda podem divergir (ex: mostrar 46% ao centro com
     * 19 de 83 na legenda, que são 23%).
     */
    const emUtilizacao =
        Number(data?.reservada ?? 0) +
        Number(data?.ocupada ?? 0);

    const taxaOcupacao =
        totalSecretarias > 0
            ? Math.round(
                  (emUtilizacao / totalSecretarias) * 100,
              )
            : 0;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                    <PieChartIcon
                        size={20}
                        strokeWidth={1.9}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Ocupação atual
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Todos os pisos
                        </span>
                    </div>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {totalSecretarias} secretárias
                    </p>
                </div>
            </header>

            <div className="flex-1 grid content-center gap-5 p-5 sm:grid-cols-[190px_1fr] xl:grid-cols-1 2xl:grid-cols-[190px_1fr]">
                <div className="relative h-[190px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={86}
                                paddingAngle={2}
                                stroke="none"
                                isAnimationActive
                                animationDuration={800}
                            >
                                {chartData.map((item) => (
                                    <Cell
                                        key={item.key}
                                        fill={
                                            COLORS[item.key]
                                        }
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                content={<DonutTooltip />}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <strong className="text-3xl font-black text-slate-900 dark:text-white">
                            {taxaOcupacao}%
                        </strong>

                        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Ocupação
                        </span>

                        <span className="text-[10px] text-slate-400">
                            Atual
                        </span>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                    {chartData.map((item) => {
                        const percentagem =
                            totalSecretarias > 0
                                ? Math.round(
                                      (item.value /
                                          totalSecretarias) *
                                          100,
                                  )
                                : 0;

                        return (
                            <div
                                key={item.key}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                COLORS[
                                                    item.key
                                                ],
                                        }}
                                    />

                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {item.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {item.value}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        · {percentagem}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
