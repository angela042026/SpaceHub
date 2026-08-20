import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

/**
 * "Reservas por Período do Dia" — barras verticais em vez de donut
 * (pedido explícito: variedade de visualizações na página, só
 * "Reservas por Piso" continua como donut). Só 3 categorias
 * (Manhã/Tarde/Dia inteiro), por isso um eixo X tradicional já não é
 * necessário — o valor aparece por cima da barra e o nome +
 * percentagem por baixo, via um "tick" a fazer de rótulo customizado.
 */
function formatarPercentual(valor) {
    return `${valor}`.replace('.', ',');
}

function RotuloValor({ x, y, width, value }) {
    return (
        <text
            x={x + width / 2}
            y={y - 10}
            textAnchor="middle"
            fontSize={15}
            fontWeight={800}
            className="fill-slate-900 dark:fill-white"
        >
            {value}
        </text>
    );
}

function TickNomePercentagem({ x, y, payload, data }) {
    const item = data[payload.index];

    if (!item) {
        return null;
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={14} textAnchor="middle" fontSize={12} fontWeight={600} className="fill-slate-700 dark:fill-slate-200">
                {item.label}
            </text>
            <text x={0} y={30} textAnchor="middle" fontSize={11} className="fill-slate-400">
                {formatarPercentual(item.percent)}%
            </text>
        </g>
    );
}

function PeriodoTooltip({ active, payload }) {
    const { t } = useTranslation('dashboard');

    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {item.label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {t('statistics.reservasCount', { count: item.total })} · {formatarPercentual(item.percent)}%
            </p>
        </div>
    );
}

export default function PeriodoBarChart({
    icon: Icon,
    title,
    subtitle,
    data = [],
    emptyMessage,
}) {
    const { t } = useTranslation('dashboard');
    const mensagemVazia = emptyMessage ?? t('statistics.semReservasPeriodo');
    const total = data.reduce((soma, item) => soma + item.total, 0);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                    <Icon size={20} strokeWidth={1.9} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="mt-0.5 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </header>

            {total === 0 ? (
                <div className="flex min-h-[150px] flex-1 items-center justify-center px-5 py-8">
                    <p className="text-sm text-slate-400">{mensagemVazia}</p>
                </div>
            ) : (
                <div className="flex flex-1 items-center p-5">
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 16 }} barCategoryGap="30%">
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    height={40}
                                    tick={(props) => <TickNomePercentagem {...props} data={data} />}
                                />

                                <Tooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                                    content={<PeriodoTooltip />}
                                />

                                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={72}>
                                    {data.map((item) => (
                                        <Cell key={item.label} fill={item.color} />
                                    ))}

                                    <LabelList dataKey="total" content={RotuloValor} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </section>
    );
}
