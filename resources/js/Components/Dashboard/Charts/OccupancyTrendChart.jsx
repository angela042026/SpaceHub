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
import { useTranslation } from 'react-i18next';

const OPCOES_DIAS = [7, 30, 90];

const DADOS_VAZIOS = {
    atual: [],
    anterior: [],
    media: 0,
    pico: 0,
    minimo: 0,
    variacaoPP: 0,
};

function CustomTooltip({ active, payload, label }) {
    const { t } = useTranslation('dashboard');

    if (!active || !payload?.length) {
        return null;
    }

    const { atual, anterior } = payload[0].payload;
    const diferenca = Math.round((atual - anterior) * 10) / 10;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl dark:border-[#2a5069] dark:bg-[#101f34]">
            <p className="text-xs font-bold text-slate-700 dark:text-[#f8fafc]">
                {label}
            </p>

            <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500 dark:text-[#b5c5d5]">{t('charts.evolucaoOcupacao.atual')}</span>
                    <span className="font-bold text-teal-600 dark:text-[#18c3b3]">
                        {atual}%
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-500 dark:text-[#b5c5d5]">{t('charts.evolucaoOcupacao.anterior')}</span>
                    <span className="font-bold text-slate-500 dark:text-[#8fa7bd]">
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
                {diferenca} {t('charts.evolucaoOcupacao.pontosPercentuais')}
            </p>
        </div>
    );
}

function BlocoEstatistica({ label, valor }) {
    return (
        <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-[#f8fafc]">
                {valor}
            </p>
            <p className="text-xs font-medium text-slate-400 dark:text-[#8fa7bd]">
                {label}
            </p>
        </div>
    );
}

export default function OccupancyTrendChart({
    data,
    pisos = [],
}) {
    const { t } = useTranslation('dashboard');
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-[#2a5069]">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <TrendingUp
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                            {t('charts.evolucaoOcupacao.titulo')}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8fa7bd]">
                            {t('charts.evolucaoOcupacao.ultimosDias', { dias })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-[#2a5069] dark:bg-[#101f34]">
                        {OPCOES_DIAS.map((valor) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() =>
                                    setDias(valor)
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    dias === valor
                                        ? 'bg-teal-500 text-white dark:bg-[#18c3b3]'
                                        : 'text-slate-500 hover:text-teal-600 dark:text-[#afc0d0] dark:hover:text-[#18c3b3]'
                                }`}
                            >
                                {t('charts.evolucaoOcupacao.diasOpcao', { count: valor })}
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
                            className="h-9 rounded-xl border border-slate-200 bg-white py-0 pl-3 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#b5c5d5]"
                        >
                            <option value="">
                                {t('charts.evolucaoOcupacao.todosOsPisos')}
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
                    label={t('charts.evolucaoOcupacao.media')}
                    valor={`${dados.media}%`}
                />

                <BlocoEstatistica
                    label={t('charts.evolucaoOcupacao.pico')}
                    valor={`${dados.pico}%`}
                />

                <BlocoEstatistica
                    label={t('charts.evolucaoOcupacao.minimo')}
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
                        {dados.variacaoPP} {t('charts.evolucaoOcupacao.pontosPercentuais')}
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
                            stroke="var(--chart-grid)"
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
                                fill: 'var(--chart-axis)',
                                fontSize: 11,
                            }}
                            dy={8}
                        />

                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: 'var(--chart-axis)',
                                fontSize: 11,
                            }}
                            tickFormatter={(value) =>
                                `${value}%`
                            }
                        />

                        <ReferenceLine
                            y={dados.media}
                            stroke="var(--chart-axis)"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            label={(props) => {
                                const { viewBox } = props;
                                const texto = t('charts.evolucaoOcupacao.mediaValor', { valor: dados.media });
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
                                            fill="var(--tooltip-bg)"
                                            stroke="var(--tooltip-border)"
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
                                            fill="var(--tooltip-text)"
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
                                stroke: 'var(--color-turquoise-strong)',
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
                            name={t('charts.evolucaoOcupacao.semanaAnterior')}
                            stroke="var(--chart-axis)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="atual"
                            name={t('charts.evolucaoOcupacao.semanaAtual')}
                            stroke="var(--color-turquoise-strong)"
                            strokeWidth={3}
                            dot={{
                                r: 3,
                                strokeWidth: 0,
                                fill: 'var(--color-turquoise-strong)',
                            }}
                            activeDot={{
                                r: 6,
                                strokeWidth: 2,
                                fill: 'var(--tooltip-bg)',
                                stroke: 'var(--color-turquoise-strong)',
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-5 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 dark:border-[#2a5069] dark:text-[#8fa7bd]">
                <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded-full bg-teal-500 dark:bg-[#18c3b3]" />
                    {t('charts.evolucaoOcupacao.semanaAtual')}
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
                            stroke="var(--chart-axis)"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                        />
                    </svg>
                    {t('charts.evolucaoOcupacao.semanaAnterior')}
                </span>
            </div>
        </section>
    );
}
