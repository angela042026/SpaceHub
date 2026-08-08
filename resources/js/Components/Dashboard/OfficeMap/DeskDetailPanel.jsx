import {
    Armchair,
    CalendarDays,
    MapPin,
    Sparkles,
    X,
} from 'lucide-react';

import { resolverImagemSecretaria } from '@/utils/imagemSetor';

import {
    COMODIDADES,
    ESTADO_VISUAL,
    estadoNormalizado,
    minutosDoDia,
} from './mapUtils';

export default function DeskDetailPanel({
    secretaria,
    setor,
    piso,
    onClose,
    onReserve,
    showOverview = false,
    overview,
}) {
    if (!secretaria) {
        if (!setor && showOverview) {
            return (
                <FloorOverview
                    floorName={piso?.nome}
                    overview={overview}
                />
            );
        }

        return (
            <aside className="dashboard-card relative flex min-h-[555px] flex-col items-center justify-center overflow-hidden p-7 text-center">
                {/* Onda decorativa com padrão de pontos, só estética */}
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-teal-500/10 dark:text-teal-400/10"
                    viewBox="0 0 400 160"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <pattern
                            id="deskPanelDots"
                            width="14"
                            height="14"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx="2"
                                cy="2"
                                r="1.4"
                                fill="currentColor"
                            />
                        </pattern>
                    </defs>
                    <path
                        d="M0,90 C90,40 150,140 240,80 C310,35 360,90 400,60 L400,160 L0,160 Z"
                        fill="currentColor"
                    />
                    <path
                        d="M0,110 C90,70 150,150 240,110 C310,75 360,110 400,90 L400,160 L0,160 Z"
                        fill="url(#deskPanelDots)"
                    />
                </svg>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                        <Armchair size={34} />
                        <Sparkles
                            size={18}
                            strokeWidth={2}
                            className="absolute -right-1 -top-1 text-teal-400"
                        />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                        {setor
                            ? 'Escolha uma secretária'
                            : 'Selecione um setor'}
                    </h3>
                    <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-500">
                        {setor
                            ? `As secretárias de ${setor.nome} estão visíveis no mapa.`
                            : 'Clique no nome de um setor no mapa para visualizar apenas as secretárias desse setor.'}
                    </p>
                </div>
            </aside>
        );
    }

    const estadoNormal = estadoNormalizado(
        secretaria.status,
    );
    const estado =
        ESTADO_VISUAL[estadoNormal] ??
        ESTADO_VISUAL.indisponivel;
    const imagem = resolverImagemSecretaria(secretaria);
    const comodidades = COMODIDADES.filter(
        ([chave]) => secretaria[chave],
    ).slice(0, 5);

    return (
        <aside className="dashboard-card flex h-full min-h-[555px] flex-col overflow-hidden p-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {secretaria.setor?.nome}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    aria-label="Fechar detalhes"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="mt-4 flex gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                    {imagem ? (
                        <img
                            src={imagem}
                            alt={secretaria.codigo}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-teal-600">
                            <Armchair
                                size={38}
                                strokeWidth={1.3}
                            />
                        </div>
                    )}
                </div>

                <div className="min-w-0 py-1">
                    <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {secretaria.codigo} · {piso.nome}
                    </p>
                    <div className="mt-4">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${estado.badgeBg} ${estado.badgeText}`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${estado.bar}`}
                            />
                            {estado.label}
                        </span>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                            {estadoNormal === 'livre'
                                ? 'Disponível agora'
                                : 'Estado neste momento'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-200 py-4 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Comodidades
                </p>

                <div className="mt-3 grid grid-cols-5 gap-2">
                    {comodidades.length > 0 ? (
                        comodidades.map(
                            ([chave, label, Icon]) => (
                                <div
                                    key={chave}
                                    className="text-center"
                                    title={label}
                                >
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        <Icon size={15} />
                                    </div>
                                    <p className="mt-1 truncate text-[8px] font-medium text-slate-500">
                                        {label}
                                    </p>
                                </div>
                            ),
                        )
                    ) : (
                        <p className="col-span-5 text-xs text-slate-400">
                            Sem comodidades registadas.
                        </p>
                    )}
                </div>
            </div>

            <AvailabilityTimeline
                periodos={secretaria.disponibilidade ?? []}
            />

            <div className="space-y-2 pt-8">
                <button
                    type="button"
                    onClick={() => onReserve(secretaria)}
                    disabled={estadoNormal === 'indisponivel'}
                    className="h-11 w-full rounded-xl bg-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                    {estadoNormal === 'livre'
                        ? 'Reservar agora'
                        : 'Ver disponibilidade'}
                </button>
            </div>
        </aside>
    );
}

function AvailabilityTimeline({ periodos }) {
    return (
        <div className="border-b border-slate-200 py-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Disponibilidade · hoje
                </p>
                <CalendarDays
                    size={13}
                    className="text-slate-400"
                />
            </div>

            <div className="mt-3 flex justify-between text-[8px] font-semibold text-slate-400">
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
            </div>

            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-teal-500">
                {periodos.map((periodo, indice) => {
                    const inicio = minutosDoDia(
                        periodo.inicio,
                    );
                    const fim = minutosDoDia(periodo.fim);
                    const estado =
                        ESTADO_VISUAL[
                            estadoNormalizado(
                                periodo.estado,
                            )
                        ] ?? ESTADO_VISUAL.reservada;

                    return (
                        <span
                            key={`${periodo.inicio}-${periodo.fim}-${indice}`}
                            className={`absolute inset-y-0 ${estado.bar}`}
                            style={{
                                left: `${(inicio / 1440) * 100}%`,
                                width: `${Math.max(
                                    ((fim - inicio) / 1440) *
                                        100,
                                    1,
                                )}%`,
                            }}
                        />
                    );
                })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] font-semibold text-slate-500">
                {Object.entries(ESTADO_VISUAL).map(
                    ([chave, item]) => (
                        <span
                            key={chave}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${item.bar}`}
                            />
                            {item.label}
                        </span>
                    ),
                )}
            </div>
        </div>
    );
}

const OVERVIEW_CORES = {
    livre: { dot: 'bg-teal-500', bar: 'bg-teal-500', texto: 'text-teal-500' },
    reservada: { dot: 'bg-blue-500', bar: 'bg-blue-500', texto: 'text-blue-500' },
    ocupada: { dot: 'bg-rose-500', bar: 'bg-rose-500', texto: 'text-rose-500' },
};

function OcupacaoRing({ linhas, percentual }) {
    const raio = 30;
    const circunferencia = 2 * Math.PI * raio;

    let acumulado = 0;

    return (
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg
                viewBox="0 0 72 72"
                className="h-20 w-20 -rotate-90"
            >
                <circle
                    cx="36"
                    cy="36"
                    r={raio}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                />

                {linhas.map((linha) => {
                    const pct = percentual(linha.valor);
                    const comprimento =
                        (pct / 100) * circunferencia;
                    const offset =
                        -((acumulado / 100) * circunferencia);

                    acumulado += pct;

                    if (pct <= 0) {
                        return null;
                    }

                    return (
                        <circle
                            key={linha.chave}
                            cx="36"
                            cy="36"
                            r={raio}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${comprimento} ${
                                circunferencia - comprimento
                            }`}
                            strokeDashoffset={offset}
                            className={
                                OVERVIEW_CORES[linha.chave]
                                    .texto
                            }
                        />
                    );
                })}
            </svg>

            <Armchair
                size={22}
                strokeWidth={1.8}
                className="absolute text-slate-400"
            />
        </div>
    );
}

function FloorOverview({ floorName, overview }) {
    const total = overview?.total ?? 0;
    const livres = overview?.livres ?? 0;
    const reservadas = overview?.reservadas ?? 0;
    const ocupadas = overview?.ocupadas ?? 0;
    const emUtilizacao = reservadas + ocupadas;

    const percentual = (valor) =>
        total > 0 ? Math.round((valor / total) * 100) : 0;

    const percentualOcupacao = percentual(emUtilizacao);

    const linhas = [
        { chave: 'livre', label: 'Livres', valor: livres },
        {
            chave: 'reservada',
            label: 'Reservadas',
            valor: reservadas,
        },
        { chave: 'ocupada', label: 'Ocupadas', valor: ocupadas },
    ];

    return (
        <aside className="dashboard-card flex h-full flex-col justify-between overflow-hidden p-5">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Visão geral
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {floorName ?? 'Piso'}
                    </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {total} secretárias
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-4xl font-extrabold text-teal-500">
                        {percentualOcupacao}%
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                        Ocupação atual
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {emUtilizacao} reservadas ou ocupadas
                    </p>
                </div>

                <OcupacaoRing
                    linhas={linhas}
                    percentual={percentual}
                />
            </div>

            <div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    {linhas.map((linha) => (
                        <span
                            key={linha.chave}
                            className={
                                OVERVIEW_CORES[linha.chave]
                                    .bar
                            }
                            style={{
                                width: `${percentual(linha.valor)}%`,
                            }}
                        />
                    ))}
                </div>

                <div className="mt-2 flex items-center justify-between">
                    {linhas
                        .filter((linha) => linha.valor > 0)
                        .map((linha) => (
                            <span
                                key={linha.chave}
                                className={`text-sm font-bold ${OVERVIEW_CORES[linha.chave].texto}`}
                            >
                                {percentual(linha.valor)}%
                            </span>
                        ))}
                </div>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {linhas.map((linha) => (
                    <div
                        key={linha.chave}
                        className="flex items-center gap-2 py-3 text-sm"
                    >
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${OVERVIEW_CORES[linha.chave].dot}`}
                        />

                        <span className="flex-1 text-slate-500 dark:text-slate-400">
                            {linha.label}
                        </span>

                        <span className="font-bold text-slate-900 dark:text-white">
                            {linha.valor}
                        </span>

                        <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-400">
                            {percentual(linha.valor)}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 dark:border-teal-400/20 dark:bg-teal-400/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                    <MapPin size={16} strokeWidth={1.8} />
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                    Selecione um setor no mapa para ver os detalhes.
                </p>
            </div>
        </aside>
    );
}
