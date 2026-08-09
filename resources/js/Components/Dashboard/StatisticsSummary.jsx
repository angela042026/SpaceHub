import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Armchair,
    Building2,
    Layers3,
    UserRound,
    Trophy,
} from 'lucide-react';

const OPCOES_PERIODO = [
    { valor: '30dias', label: '30 dias' },
    { valor: '90dias', label: '90 dias' },
    { valor: 'ano', label: 'Ano' },
];

const DIAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

// Mesmo degradê das barras de "Reservas por piso", para os gráficos
// deste card terem a mesma linguagem visual.
const GRADIENTE_TEAL = 'linear-gradient(to bottom, #2dd4bf, #0d9488)';
const GRADIENTE_AZUL = 'linear-gradient(to bottom, #60a5fa, #2563eb)';

function formatarVariacao(valor) {
    const sinal = valor > 0 ? '+' : valor < 0 ? '−' : '';

    return `${sinal}${Math.abs(valor).toLocaleString('pt-PT', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

function CardDestaque({ icon: Icon, label, badge, children }) {
    return (
        <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-[#2a5069]/60 dark:bg-[#101f34]">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <Icon size={15} strokeWidth={1.9} />
                    </span>

                    <span className="truncate text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                        {label}
                    </span>
                </div>

                {badge}
            </div>

            {children}
        </div>
    );
}

function MiniBarrasPisos({ pisos }) {
    const topPisos = (pisos ?? []).slice(0, 3);
    const maiorTotal = Math.max(
        ...topPisos.map((piso) => Number(piso.total ?? 0)),
        1,
    );

    if (topPisos.length === 0) {
        return (
            <p className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                Sem dados suficientes.
            </p>
        );
    }

    return (
        <div className="flex h-14 items-end gap-1">
            {topPisos.map((piso, indice) => {
                const altura = Math.max(
                    (Number(piso.total ?? 0) / maiorTotal) * 100,
                    6,
                );

                return (
                    <div
                        key={piso.id}
                        className="flex flex-1 flex-col items-center gap-1"
                    >
                        <div className="flex h-11 w-full items-end">
                            <div
                                className="w-full rounded-t-md transition-all duration-500"
                                style={{
                                    height: `${altura}%`,
                                    background:
                                        indice === 0
                                            ? GRADIENTE_TEAL
                                            : GRADIENTE_AZUL,
                                }}
                            />
                        </div>

                        <span className="text-[10px] font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {piso.codigo ?? piso.nome}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function MiniSparklineSetor({ tendencia, label }) {
    const pontos = tendencia?.pontos ?? [];
    const [aExibirTooltip, setExibirTooltip] = useState(false);

    if (pontos.length < 2) {
        return (
            <p className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                Sem dados suficientes.
            </p>
        );
    }

    const valores = pontos.map((ponto) => Number(ponto.total));
    const maximo = Math.max(...valores, 1);
    const minimo = Math.min(...valores, 0);
    const amplitude = maximo - minimo || 1;

    const largura = 100;
    const altura = 44;

    const coordenadas = valores.map((valor, indice) => {
        const x =
            pontos.length > 1
                ? (indice / (pontos.length - 1)) * largura
                : 0;
        const y =
            altura -
            ((valor - minimo) / amplitude) * (altura - 6) -
            3;

        return `${x},${y}`;
    });

    const pontosLinha = coordenadas.join(' ');
    const pontosArea = `0,${altura} ${pontosLinha} ${largura},${altura}`;

    return (
        <div
            className="relative h-14 w-full cursor-pointer"
            onMouseEnter={() => setExibirTooltip(true)}
            onMouseLeave={() => setExibirTooltip(false)}
        >
            <svg
                viewBox={`0 0 ${largura} ${altura}`}
                preserveAspectRatio="none"
                className="h-full w-full"
            >
                <polygon
                    points={pontosArea}
                    fill="url(#setorSparklineGradient)"
                />

                <defs>
                    <linearGradient
                        id="setorSparklineGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--color-turquoise-strong)"
                            stopOpacity={0.35}
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-turquoise-strong)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>

                <polyline
                    points={pontosLinha}
                    fill="none"
                    stroke="var(--color-turquoise-strong)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {aExibirTooltip && (
                <div className="absolute right-0 top-0 z-10 w-max max-w-[160px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-lg dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#b5c5d5]">
                    {tendencia.total} reservas {label}
                </div>
            )}
        </div>
    );
}

function MiniBarrasSemana({ distribuicao }) {
    const valores = distribuicao ?? [];
    const maximo = Math.max(...valores, 1);

    if (valores.length === 0) {
        return (
            <p className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                Sem dados suficientes.
            </p>
        );
    }

    return (
        <div className="flex h-14 items-end gap-1">
            {valores.map((valor, indice) => {
                const altura = Math.max(
                    (valor / maximo) * 65,
                    valor > 0 ? 10 : 4,
                );

                return (
                    <div
                        key={indice}
                        className="flex flex-1 flex-col items-center gap-1"
                    >
                        <div className="flex h-11 w-full items-end">
                            <div
                                className="w-full rounded-t-md transition-all duration-500"
                                style={{
                                    height: `${altura}%`,
                                    background: GRADIENTE_TEAL,
                                }}
                            />
                        </div>

                        <span className="text-[9px] font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {DIAS_SEMANA[indice]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Estilo "empilhado em blocos" — usado só na Secretária destaque para
 * diferenciar visualmente do Utilizador mais ativo (que usa barra
 * lisa), como na referência.
 */
const SEGMENTOS_POR_BARRA = 3;

function MiniBarrasSegmentadas({ distribuicao }) {
    const valores = distribuicao ?? [];
    const maximo = Math.max(...valores, 1);

    if (valores.length === 0) {
        return (
            <p className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                Sem dados suficientes.
            </p>
        );
    }

    return (
        <div className="flex h-14 items-end gap-1">
            {valores.map((valor, indice) => {
                const segmentosPreenchidos = Math.max(
                    Math.round(
                        (valor / maximo) * SEGMENTOS_POR_BARRA,
                    ),
                    valor > 0 ? 1 : 0,
                );

                return (
                    <div
                        key={indice}
                        className="flex flex-1 flex-col items-center gap-1"
                    >
                        <div className="flex h-11 w-full flex-col-reverse gap-[3px]">
                            {Array.from({
                                length: SEGMENTOS_POR_BARRA,
                            }).map((_, segIndice) => (
                                <div
                                    key={segIndice}
                                    className="w-full flex-1 rounded-[3px] transition-colors duration-500"
                                    style={{
                                        background:
                                            segIndice <
                                            segmentosPreenchidos
                                                ? GRADIENTE_TEAL
                                                : 'var(--color-border)',
                                    }}
                                />
                            ))}
                        </div>

                        <span className="text-[9px] font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {DIAS_SEMANA[indice]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function StatisticsSummary({ estatisticas }) {
    const [periodo, setPeriodo] = useState('30dias');
    const [dados, setDados] = useState(estatisticas);
    const [aCarregar, setACarregar] = useState(false);
    const primeiraRenderizacao = useRef(true);

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const controlador = new AbortController();

        setACarregar(true);

        fetch(route('dashboard.destaques', { periodo }), {
            headers: { Accept: 'application/json' },
            signal: controlador.signal,
        })
            .then((response) => response.json())
            .then((novosDados) => setDados(novosDados))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error(error);
                }
            })
            .finally(() => setACarregar(false));

        return () => controlador.abort();
    }, [periodo]);

    const pisoTop = dados?.pisoMaisUtilizado;
    const setorTop = dados?.setorMaisUtilizado;
    const utilizadorTop = dados?.utilizadoresComMaisReservas?.[0];
    const secretariaTop = dados?.secretariasMaisUtilizadas?.[0];
    const tendenciaSetorTop = dados?.tendenciaSetorTop;

    const totalReservasPorPiso = (
        dados?.pisosPorUtilizacao ?? []
    ).reduce(
        (soma, piso) => soma + Number(piso.total ?? 0),
        0,
    );

    const percentualPiso =
        pisoTop && totalReservasPorPiso > 0
            ? Math.round(
                  (Number(pisoTop.total ?? 0) /
                      totalReservasPorPiso) *
                      100,
              )
            : null;

    const labelPeriodo = OPCOES_PERIODO.find(
        (opcao) => opcao.valor === periodo,
    )?.label;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-[#2a5069]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <Trophy size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-[#f8fafc]">
                            Destaques do período
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-[#8fa7bd]">
                            Últimos {labelPeriodo}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-[#2a5069] dark:bg-[#101f34]">
                    {OPCOES_PERIODO.map((opcao) => (
                        <button
                            key={opcao.valor}
                            type="button"
                            onClick={() =>
                                setPeriodo(opcao.valor)
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                periodo === opcao.valor
                                    ? 'bg-teal-500 text-white dark:bg-[#18c3b3]'
                                    : 'text-slate-500 hover:text-teal-600 dark:text-[#afc0d0] dark:hover:text-[#18c3b3]'
                            }`}
                        >
                            {opcao.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div
                    className={`grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 ${
                        aCarregar ? 'opacity-50' : 'opacity-100'
                    }`}
                >
                    <CardDestaque
                        icon={Building2}
                        label="Piso líder"
                    >
                        <p className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                            {pisoTop?.nome ?? 'Sem dados'}
                        </p>

                        <p className="-mt-1.5 text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {pisoTop?.total ?? 0} reservas
                            {percentualPiso !== null
                                ? ` · ${percentualPiso}%`
                                : ''}
                        </p>

                        <MiniBarrasPisos
                            pisos={dados?.pisosPorUtilizacao}
                        />
                    </CardDestaque>

                    <CardDestaque
                        icon={Layers3}
                        label="Setor mais procurado"
                        badge={
                            tendenciaSetorTop?.variacaoPercentual !=
                            null ? (
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        tendenciaSetorTop.variacaoPercentual >=
                                        0
                                            ? 'bg-green-500/10 text-green-600 dark:bg-[#22c983]/10 dark:text-[#22c983]'
                                            : 'bg-rose-500/10 text-rose-600 dark:bg-[#ff4d6d]/10 dark:text-[#ff4d6d]'
                                    }`}
                                >
                                    {formatarVariacao(
                                        tendenciaSetorTop.variacaoPercentual,
                                    )}
                                </span>
                            ) : null
                        }
                    >
                        <p className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                            {setorTop?.nome ?? 'Sem dados'}
                        </p>

                        <p className="-mt-1.5 text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {setorTop?.total ?? 0} reservas
                        </p>

                        <MiniSparklineSetor
                            tendencia={tendenciaSetorTop}
                            label={`nos últimos ${labelPeriodo}`}
                        />
                    </CardDestaque>

                    <CardDestaque
                        icon={UserRound}
                        label="Utilizador mais ativo"
                    >
                        <div className="flex items-center gap-2.5">
                            {utilizadorTop?.user
                                ?.fotografia_url ? (
                                <img
                                    src={
                                        utilizadorTop.user
                                            .fotografia_url
                                    }
                                    alt=""
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                            ) : (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                                    {utilizadorTop?.user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ?? '?'}
                                </span>
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                                    {utilizadorTop?.user
                                        ?.name ?? 'Sem dados'}
                                </p>

                                <p className="text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                                    {utilizadorTop?.total ?? 0}{' '}
                                    reservas
                                </p>
                            </div>
                        </div>

                        <MiniBarrasSemana
                            distribuicao={
                                dados?.distribuicaoUtilizadorTop
                            }
                        />
                    </CardDestaque>

                    <CardDestaque
                        icon={Armchair}
                        label="Secretária destaque"
                        badge={
                            secretariaTop ? (
                                <span className="shrink-0 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                                    Top 1
                                </span>
                            ) : null
                        }
                    >
                        <p className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                            {secretariaTop?.secretaria
                                ?.codigo ?? 'Sem dados'}
                        </p>

                        <p className="-mt-1.5 text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {secretariaTop?.total ?? 0} reservas
                        </p>

                        <MiniBarrasSegmentadas
                            distribuicao={
                                dados?.distribuicaoSecretariaTop
                            }
                        />
                    </CardDestaque>
                </div>

                <Link
                    href={route('admin.statistics.index')}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-600 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 hover:text-teal-700 dark:border-[#36566f] dark:bg-transparent dark:text-[#d7e3ed] dark:hover:border-[#18c3b3] dark:hover:bg-none dark:hover:bg-[#18c3b3]/[0.06] dark:hover:text-[#18c3b3]"
                >
                    Ver estatísticas completas
                    <ArrowRight size={15} strokeWidth={1.9} />
                </Link>
            </div>
        </section>
    );
}
