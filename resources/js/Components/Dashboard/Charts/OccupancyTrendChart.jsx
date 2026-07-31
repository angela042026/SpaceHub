import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const dadosPadrao = [
    { dia: 'Seg', ocupacao: 48 },
    { dia: 'Ter', ocupacao: 62 },
    { dia: 'Qua', ocupacao: 55 },
    { dia: 'Qui', ocupacao: 74 },
    { dia: 'Sex', ocupacao: 81 },
    { dia: 'Sáb', ocupacao: 39 },
    { dia: 'Dom', ocupacao: 28 },
];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {payload[0].value}% de ocupação
            </p>
        </div>
    );
}

export default function OccupancyTrendChart({
    data = dadosPadrao,
}) {
    const ocupacaoMedia =
        data.length > 0
            ? Math.round(
                  data.reduce(
                      (total, item) =>
                          total + Number(item.ocupacao ?? 0),
                      0,
                  ) / data.length,
              )
            : 0;

    return (
        <section className="dashboard-card h-full overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                            <TrendingUp
                                size={19}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Evolução da Ocupação
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Últimos 7 dias
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Média
                    </p>

                    <strong className="text-xl font-bold text-slate-900 dark:text-white">
                        {ocupacaoMedia}%
                    </strong>
                </div>
            </div>

            <div className="h-[320px] px-2 pb-4 pt-5 sm:px-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart
                        data={data}
                        margin={{
                            top: 8,
                            right: 12,
                            left: -18,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="ocupacaoGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#14b8a6"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#14b8a6"
                                    stopOpacity={0.02}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="#e2e8f0"
                            opacity={0.7}
                        />

                        <XAxis
                            dataKey="dia"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: '#94a3b8',
                                fontSize: 12,
                            }}
                            dy={8}
                        />

                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: '#94a3b8',
                                fontSize: 11,
                            }}
                            tickFormatter={(value) =>
                                `${value}%`
                            }
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: '#14b8a6',
                                strokeDasharray: '4 4',
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="ocupacao"
                            stroke="#14b8a6"
                            strokeWidth={3}
                            fill="url(#ocupacaoGradient)"
                            activeDot={{
                                r: 5,
                                strokeWidth: 2,
                                fill: '#ffffff',
                                stroke: '#14b8a6',
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
