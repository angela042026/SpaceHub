import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    PieChart as PieChartIcon,
} from 'lucide-react';

const COLORS = {
    livre: '#14b8a6',
    reservada: '#3b82f6',
    ocupada: '#f43f5e',
};

// Mesmo degradê das barras de "Reservas por piso", aplicado ao donut e
// às barras de progresso da legenda.
const GRADIENTES = {
    livre: 'url(#gradienteLivre)',
    reservada: 'url(#gradienteReservada)',
    ocupada: 'url(#gradienteOcupada)',
};

const GRADIENTES_CSS = {
    livre: 'linear-gradient(to right, #2dd4bf, #0d9488)',
    reservada: 'linear-gradient(to right, #60a5fa, #2563eb)',
    ocupada: 'linear-gradient(to right, #fb7185, #e11d48)',
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
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-[#2a5069] dark:bg-[#101f34]">
            <p className="text-xs font-semibold text-slate-500 dark:text-[#b5c5d5]">
                {item.name}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                {item.value} secretárias
            </p>
        </div>
    );
}

/**
 * Mensagem de rodapé varia com a disponibilidade real — não é
 * decorativa, ajuda o admin a perceber de relance se precisa de agir.
 */
function obterEstadoRodape(percentDisponivel, totalSecretarias) {
    if (totalSecretarias === 0) {
        return {
            texto: 'Sem secretárias configuradas neste piso.',
            cor: 'bg-slate-100 text-slate-500 dark:bg-[#183f5d] dark:text-[#8fa7bd]',
            icon: Info,
        };
    }

    if (percentDisponivel === 100) {
        return {
            texto: 'Todas as secretárias estão disponíveis.',
            cor: 'bg-green-500/10 text-green-600 dark:bg-[#22c983]/10 dark:text-[#22c983]',
            icon: CheckCircle2,
        };
    }

    if (percentDisponivel <= 10) {
        return {
            texto: 'Ocupação perto do limite — pouca disponibilidade.',
            cor: 'bg-rose-500/10 text-rose-600 dark:bg-[#ff4d6d]/10 dark:text-[#ff4d6d]',
            icon: AlertTriangle,
        };
    }

    return {
        texto: `${100 - percentDisponivel}% da capacidade está em uso.`,
        cor: 'bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/10 dark:text-[#18c3b3]',
        icon: Info,
    };
}

export default function OccupancyDonutChart({ data, porPiso = {}, pisos = [] }) {
    const [pisoSelecionado, setPisoSelecionado] = useState('');

    const dadosBase =
        pisoSelecionado && porPiso[pisoSelecionado]
            ? {
                  livre: porPiso[pisoSelecionado].livres,
                  reservada: porPiso[pisoSelecionado].reservadas,
                  ocupada: porPiso[pisoSelecionado].ocupadas,
              }
            : data;

    const chartData = [
        {
            key: 'livre',
            name: LABELS.livre,
            value: Number(dadosBase?.livre ?? 0),
        },
        {
            key: 'reservada',
            name: LABELS.reservada,
            value: Number(dadosBase?.reservada ?? 0),
        },
        {
            key: 'ocupada',
            name: LABELS.ocupada,
            value: Number(dadosBase?.ocupada ?? 0),
        },
    ];

    const totalSecretarias = chartData.reduce(
        (total, item) => total + item.value,
        0,
    );

    /*
     * A percentagem central tem de vir sempre dos mesmos 3 números que a
     * legenda mostra — nunca de uma métrica calculada à parte, senão o
     * donut e a legenda podem divergir.
     */
    const emUtilizacao =
        Number(dadosBase?.reservada ?? 0) +
        Number(dadosBase?.ocupada ?? 0);

    const taxaOcupacao =
        totalSecretarias > 0
            ? Math.round((emUtilizacao / totalSecretarias) * 100)
            : 0;

    const percentDisponivel =
        totalSecretarias > 0 ? 100 - taxaOcupacao : 0;

    const estadoRodape = obterEstadoRodape(
        percentDisponivel,
        totalSecretarias,
    );
    const IconeRodape = estadoRodape.icon;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-[#2a5069]">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <PieChartIcon
                            size={20}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                            Estado atual
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400 dark:text-[#8fa7bd]">
                            {totalSecretarias} secretárias
                        </p>
                    </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-[#22c983]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 dark:bg-[#22c983]" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-[#22c983]" />
                    </span>
                    Agora
                </span>
            </header>

            {pisos.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 py-3 dark:border-[#2a5069]">
                    <button
                        type="button"
                        onClick={() => setPisoSelecionado('')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            pisoSelecionado === ''
                                ? 'bg-teal-500 text-white dark:bg-[#18c3b3]'
                                : 'bg-slate-100 text-slate-500 hover:text-teal-600 dark:bg-[#101f34] dark:text-[#afc0d0] dark:hover:text-[#18c3b3]'
                        }`}
                    >
                        Todos
                    </button>

                    {pisos.map((piso) => (
                        <button
                            key={piso.codigo}
                            type="button"
                            onClick={() =>
                                setPisoSelecionado(
                                    piso.codigo,
                                )
                            }
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                pisoSelecionado === piso.codigo
                                    ? 'bg-teal-500 text-white dark:bg-[#18c3b3]'
                                    : 'bg-slate-100 text-slate-500 hover:text-teal-600 dark:bg-[#101f34] dark:text-[#afc0d0] dark:hover:text-[#18c3b3]'
                            }`}
                        >
                            {piso.nome}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 grid content-center gap-5 p-5 sm:grid-cols-[190px_1fr] xl:grid-cols-1 2xl:grid-cols-[190px_1fr]">
                <div className="relative h-[190px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <defs>
                                <linearGradient
                                    id="gradienteLivre"
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
                                    id="gradienteReservada"
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

                                <linearGradient
                                    id="gradienteOcupada"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#fb7185"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#e11d48"
                                    />
                                </linearGradient>
                            </defs>

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
                                            GRADIENTES[item.key]
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
                        <strong className="text-3xl font-black text-slate-900 dark:text-[#f8fafc]">
                            {taxaOcupacao}%
                        </strong>

                        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#8fa7bd]">
                            Ocupação
                        </span>

                        <span className="text-[10px] text-slate-400 dark:text-[#8fa7bd]">
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
                            <div key={item.key}>
                                <div className="flex items-center justify-between">
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

                                        <span className="text-sm font-medium text-slate-700 dark:text-[#d7e3ed]">
                                            {item.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                                            {item.value}
                                        </span>

                                        <span className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                                            · {percentagem}%
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#101f34]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentagem}%`,
                                            background:
                                                GRADIENTES_CSS[
                                                    item.key
                                                ],
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-5 pb-5">
                <p
                    className={`flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-center text-xs font-semibold ${estadoRodape.cor}`}
                >
                    <IconeRodape size={14} strokeWidth={2} />
                    {estadoRodape.texto}
                </p>
            </div>
        </section>
    );
}
