import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    TrendingUp,
} from 'lucide-react';

const OPCOES_DIAS = [
    { valor: 7, label: '7 dias' },
    { valor: 30, label: '30 dias' },
    { valor: 90, label: '90 dias' },
];

const DADOS_VAZIOS = {
    atual: [],
    anterior: [],
    media: 0,
    pico: 0,
    minimo: 0,
    variacaoPP: 0,
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const { atual, anterior } = payload[0].payload;
    const diferenca = Math.round((atual - anterior) * 10) / 10;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {label}
            </p>

            <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500">Atual</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                        {atual}%
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500">Anterior</span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                        {anterior}%
                    </span>
                </div>
            </div>

            <p
                className={`mt-2 text-xs font-bold ${
                    diferenca >= 0
                        ? 'text-green-500'
                        : 'text-rose-500'
                }`}
            >
                {diferenca >= 0 ? '+' : ''}
                {diferenca} p.p.
            </p>
        </div>
    );
}

function BlocoEstatistica({ label, valor }) {
    return (
        <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {valor}
            </p>
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>
        </div>
    );
}

export default function OccupancyTrendChart({
    data,
    pisos = [],
}) {
    const [dias, setDias] = useState(7);
    const [pisoId, setPisoId] = useState('');
    const [dados, setDados] = useState(data ?? DADOS_VAZIOS);
    const [aCarregar, setACarregar] = useState(false);
    const primeiraRenderizacao = useRef(true);

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const controlador = new AbortController();

        setACarregar(true);

        fetch(
            route('dashboard.tendenciaOcupacao', {
                dias,
                ...(pisoId ? { piso_id: pisoId } : {}),
            }),
            {
                headers: { Accept: 'application/json' },
                signal: controlador.signal,
            },
        )
            .then((response) => response.json())
            .then((novosDados) => setDados(novosDados))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error(error);
                }
            })
            .finally(() => setACarregar(false));

        return () => controlador.abort();
    }, [dias, pisoId]);

    const chartData = dados.atual.map((item, indice) => ({
        dia: item.dia,
        atual: item.ocupacao,
        anterior: dados.anterior[indice]?.ocupacao ?? 0,
    }));

    const variacaoPositiva = dados.variacaoPP >= 0;

    return (
        <section className="dashboard-card h-full overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
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
                            Últimos {dias} dias
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        {OPCOES_DIAS.map((opcao) => (
                            <button
                                key={opcao.valor}
                                type="button"
                                onClick={() =>
                                    setDias(opcao.valor)
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    dias === opcao.valor
                                        ? 'bg-teal-500 text-white'
                                        : 'text-slate-500 hover:text-teal-600 dark:text-slate-400'
                                }`}
                            >
                                {opcao.label}
                            </button>
                        ))}
                    </div>

                    {pisos.length > 0 && (
                        <select
                            value={pisoId}
                            onChange={(evento) =>
                                setPisoId(
                                    evento.target.value,
                                )
                            }
                            className="h-9 rounded-xl border border-slate-200 bg-white py-0 pl-3 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <option value="">
                                Todos os pisos
                            </option>

                            {pisos.map((piso) => (
                                <option
                                    key={piso.id}
                                    value={piso.id}
                                >
                                    {piso.nome}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 px-5 pt-4">
                <BlocoEstatistica
                    label="Média"
                    valor={`${dados.media}%`}
                />

                <BlocoEstatistica
                    label="Pico"
                    valor={`${dados.pico}%`}
                />

                <BlocoEstatistica
                    label="Mínimo"
                    valor={`${dados.minimo}%`}
                />

                {dados.variacaoPP !== 0 && (
                    <span
                        className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                            variacaoPositiva
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                    >
                        {variacaoPositiva ? (
                            <ArrowUpRight
                                size={13}
                                strokeWidth={2.6}
                            />
                        ) : (
                            <ArrowDownRight
                                size={13}
                                strokeWidth={2.6}
                            />
                        )}
                        {variacaoPositiva ? '+' : ''}
                        {dados.variacaoPP} p.p.
                    </span>
                )}
            </div>

            <div
                className={`h-[300px] px-2 pb-4 pt-4 transition-opacity sm:px-4 ${
                    aCarregar ? 'opacity-50' : 'opacity-100'
                }`}
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <ComposedChart
                        data={chartData}
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
                                    stopOpacity={0.3}
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
                            interval={
                                dias > 7
                                    ? Math.ceil(dias / 8)
                                    : 0
                            }
                            tick={{
                                fill: '#94a3b8',
                                fontSize: 11,
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

                        <ReferenceLine
                            y={dados.media}
                            stroke="#64748b"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            label={(props) => {
                                const { viewBox } = props;
                                const texto = `Média ${dados.media}%`;
                                const largura =
                                    texto.length * 6 + 14;

                                return (
                                    <g>
                                        <rect
                                            x={viewBox.x + 6}
                                            y={viewBox.y - 18}
                                            width={largura}
                                            height={16}
                                            rx={4}
                                            fill="#ffffff"
                                            stroke="#cbd5e1"
                                            strokeWidth={1}
                                        />

                                        <text
                                            x={
                                                viewBox.x +
                                                6 +
                                                largura / 2
                                            }
                                            y={viewBox.y - 7}
                                            textAnchor="middle"
                                            fontSize={10}
                                            fontWeight={700}
                                            fill="#475569"
                                        >
                                            {texto}
                                        </text>
                                    </g>
                                );
                            }}
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
                            dataKey="atual"
                            stroke="none"
                            fill="url(#ocupacaoGradient)"
                            isAnimationActive={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="anterior"
                            name="Semana anterior"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="atual"
                            name="Semana atual"
                            stroke="#14b8a6"
                            strokeWidth={3}
                            dot={{
                                r: 3,
                                strokeWidth: 0,
                                fill: '#14b8a6',
                            }}
                            activeDot={{
                                r: 6,
                                strokeWidth: 2,
                                fill: '#ffffff',
                                stroke: '#14b8a6',
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-5 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded-full bg-teal-500" />
                    Semana atual
                </span>

                <span className="flex items-center gap-1.5">
                    <svg
                        width="20"
                        height="2"
                        viewBox="0 0 20 2"
                        aria-hidden="true"
                    >
                        <line
                            x1="0"
                            y1="1"
                            x2="20"
                            y2="1"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                        />
                    </svg>
                    Semana anterior
                </span>
            </div>
        </section>
    );
}
