import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/**
 * Isolado do StatisticsPanel para poder ser importado com React.lazy —
 * o recharts só é descarregado quando este gráfico é mesmo renderizado,
 * em vez de entrar sempre no bundle da página de Estatísticas.
 */
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

export default function PremiumChart({
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
