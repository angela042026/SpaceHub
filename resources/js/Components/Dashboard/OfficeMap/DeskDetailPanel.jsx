import { Link } from '@inertiajs/react';
import {
    Armchair,
    CalendarDays,
    Check,
    ChevronRight,
    HelpCircle,
    Info,
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
    setoresDoPiso,
    onSelecionarSetor,
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

        if (!setor && setoresDoPiso?.length > 0) {
            return (
                <SetoresDoPisoPanel
                    piso={piso}
                    setores={setoresDoPiso}
                    onSelecionarSetor={onSelecionarSetor}
                />
            );
        }

        if (setor && setoresDoPiso?.length > 0) {
            return (
                <SetorSelecionadoPanel
                    setor={setor}
                    piso={piso}
                    onAlterarSetor={() =>
                        onSelecionarSetor?.(setor)
                    }
                />
            );
        }

        return (
            <aside className="dashboard-card relative flex h-[460px] flex-col items-center justify-center overflow-hidden p-7 text-center sm:h-[550px] xl:h-[585px]">
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
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <Armchair size={34} />
                        <Sparkles
                            size={18}
                            strokeWidth={2}
                            className="absolute -right-1 -top-1 text-teal-400 dark:text-[#18c3b3]"
                        />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-[#f8fafc]">
                        {setor
                            ? 'Escolha uma secretária'
                            : 'Selecione um setor'}
                    </h3>
                    <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-500 dark:text-[#b5c5d5]">
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
        <aside className="dashboard-card flex h-[460px] flex-col overflow-hidden p-5 sm:h-[550px] xl:h-[585px]">
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

            <div className="mt-4 flex gap-3 border-b border-slate-200 pb-4 dark:border-[#2a5069]">
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
                        <p className="mt-1.5 text-[10px] text-slate-400 dark:text-[#8fa7bd]">
                            {estadoNormal === 'livre'
                                ? 'Disponível agora'
                                : 'Estado neste momento'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-200 py-4 dark:border-[#2a5069]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8fa7bd]">
                    Comodidades
                </p>

                <div className="mt-3 grid grid-cols-5 gap-2">
                    {comodidades.length > 0 ? (
                        comodidades.map(
                            ([chave, label, Icon]) => (
                                <div
                                    key={chave}
                                    className="group text-center"
                                    title={label}
                                >
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-700 transition-colors duration-200 group-hover:bg-teal-500/15 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-[#18c3b3]/20 dark:group-hover:text-[#18c3b3]">
                                        <Icon size={15} strokeWidth={1.8} />
                                    </div>
                                    <p className="mt-1 truncate text-[8px] font-medium text-slate-500 dark:text-[#8fa7bd]">
                                        {label}
                                    </p>
                                </div>
                            ),
                        )
                    ) : (
                        <p className="col-span-5 text-xs text-slate-400 dark:text-[#8fa7bd]">
                            Sem comodidades registadas.
                        </p>
                    )}
                </div>
            </div>

            <AvailabilityTimeline
                periodos={secretaria.disponibilidade ?? []}
            />

            <div className="flex flex-1 flex-col items-stretch justify-center space-y-2">
                <button
                    type="button"
                    onClick={() => onReserve(secretaria)}
                    disabled={estadoNormal === 'indisponivel'}
                    className="h-11 w-full rounded-xl bg-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-[#2a5069] dark:disabled:text-[#8fa7bd]"
                >
                    {estadoNormal === 'livre'
                        ? 'Reservar agora'
                        : 'Ver disponibilidade'}
                </button>
            </div>
        </aside>
    );
}

function formatarMinutos(minutos) {
    const horas = Math.floor(minutos / 60) % 24;
    const mins = minutos % 60;

    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Resumo dinâmico acima da timeline — olha só para os dados reais de
// `periodos` (nunca inventa texto): identifica o segmento que contém a
// hora atual e descreve até quando esse estado se mantém.
function resumirDisponibilidade(periodos, agoraMinutos) {
    const segmentoAtual = periodos.find((periodo) => {
        const inicio = minutosDoDia(periodo.inicio);
        const fim = minutosDoDia(periodo.fim);
        return agoraMinutos >= inicio && agoraMinutos < fim;
    });

    if (segmentoAtual) {
        const estadoAtual = estadoNormalizado(segmentoAtual.estado);
        const fim = minutosDoDia(segmentoAtual.fim);

        if (estadoAtual === 'livre') {
            return `Disponível até às ${formatarMinutos(fim)}`;
        }

        const rotulo = ESTADO_VISUAL[estadoAtual]?.label ?? 'Indisponível';
        return `${rotulo} até às ${formatarMinutos(fim)}`;
    }

    const proximoBloqueio = periodos
        .filter((periodo) => estadoNormalizado(periodo.estado) !== 'livre')
        .map((periodo) => minutosDoDia(periodo.inicio))
        .filter((inicio) => inicio > agoraMinutos)
        .sort((a, b) => a - b)[0];

    if (proximoBloqueio !== undefined) {
        return `Disponível até às ${formatarMinutos(proximoBloqueio)}`;
    }

    return 'Disponível durante todo o período selecionado';
}

export function AvailabilityTimeline({ periodos }) {
    const agoraMinutos = minutosDoDia(
        new Date().toTimeString().slice(0, 5),
    );
    const resumo = resumirDisponibilidade(periodos, agoraMinutos);

    return (
        <div className="border-b border-slate-200 py-4 dark:border-[#2a5069]">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8fa7bd]">
                    Disponibilidade · hoje
                </p>
                <CalendarDays
                    size={13}
                    className="text-slate-400 dark:text-[#8fa7bd]"
                />
            </div>

            <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-[#d7e3ed]">
                {resumo}
            </p>

            <div className="mt-3 flex justify-between text-[8px] font-semibold text-slate-400 dark:text-[#8fa7bd]">
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
                    const estadoChave = estadoNormalizado(
                        periodo.estado,
                    );
                    const estado =
                        ESTADO_VISUAL[estadoChave] ??
                        ESTADO_VISUAL.reservada;

                    return (
                        <span
                            key={`${periodo.inicio}-${periodo.fim}-${indice}`}
                            title={`${estado.label} · ${periodo.inicio}–${periodo.fim}`}
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

                <span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-[2px] -translate-x-1/2 bg-navy-900/70 dark:bg-white/70"
                    style={{
                        left: `${Math.min(100, Math.max(0, (agoraMinutos / 1440) * 100))}%`,
                    }}
                />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] font-semibold text-slate-500 dark:text-[#8fa7bd]">
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

// Mesmo degradê usado nos gráficos do dashboard (Reservas por piso,
// Estado atual, Destaques do período), para manter a linguagem visual
// consistente em todo o lado.
const OVERVIEW_CORES = {
    livre: { dot: 'bg-teal-500' },
    reservada: { dot: 'bg-blue-500' },
    ocupada: { dot: 'bg-rose-500' },
};

const GRADIENTES_BARRA_CSS = {
    livre: 'linear-gradient(to right, #2dd4bf, #0d9488)',
    reservada: 'linear-gradient(to right, #60a5fa, #2563eb)',
    ocupada: 'linear-gradient(to right, #fb7185, #e11d48)',
};

const CORES_TEXTO = {
    livre: 'text-teal-500',
    reservada: 'text-blue-500',
    ocupada: 'text-rose-500',
};

/**
 * Alternativa ao estado vazio genérico quando nada está selecionado —
 * em vez de só pedir para clicar num setor no mapa, já lista os
 * setores do piso atual com disponibilidade real e características,
 * para o espaço continuar útil antes de qualquer seleção. Só aparece
 * quando `showOverview` não está ativo (ou seja, não no Administrador).
 */
const SEGMENTOS_DISPONIBILIDADE = 12;

function BarraDisponibilidadeSetor({ livres, reservadas, total }) {
    const segmentosLivres =
        total > 0
            ? Math.round((livres / total) * SEGMENTOS_DISPONIBILIDADE)
            : 0;
    const segmentosReservados =
        total > 0
            ? Math.round(
                  (reservadas / total) * SEGMENTOS_DISPONIBILIDADE,
              )
            : 0;

    return (
        <div className="mt-2 flex gap-[3px]">
            {Array.from({ length: SEGMENTOS_DISPONIBILIDADE }).map(
                (_, indice) => {
                    let cor = 'bg-slate-200 dark:bg-[#2a5069]';

                    if (indice < segmentosLivres) {
                        cor = 'bg-teal-500 dark:bg-[#18c3b3]';
                    } else if (
                        indice <
                        segmentosLivres + segmentosReservados
                    ) {
                        cor = 'bg-amber-400';
                    }

                    return (
                        <span
                            key={indice}
                            className={`h-1.5 flex-1 rounded-full ${cor}`}
                        />
                    );
                },
            )}
        </div>
    );
}

function SetoresDoPisoPanel({ piso, setores, onSelecionarSetor }) {
    const maiorSetorId = setores.reduce(
        (maior, setor) =>
            !maior || setor.total > maior.total ? setor : maior,
        null,
    )?.id;

    const passos = [
        { numero: 1, label: 'Setor' },
        { numero: 2, label: 'Secretária' },
        { numero: 3, label: 'Reservar' },
    ];
    const passoAtual = 1;

    return (
        <aside className="dashboard-card flex h-[460px] flex-col p-5 sm:h-[550px] xl:h-[585px]">
            <div className="flex shrink-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-[#18c3b3]">
                        Reserva rápida
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
                        Escolha onde quer ficar
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-[#8fa7bd]">
                        Selecione primeiro um setor
                        {piso?.nome ? ` do ${piso.nome}` : ''}.
                    </p>
                </div>

                <Link
                    href={route('faqs.index')}
                    title="Ajuda"
                    aria-label="Ajuda"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-teal-400 hover:text-teal-600 dark:border-[#2a5069] dark:text-[#8fa7bd]"
                >
                    <HelpCircle size={16} strokeWidth={1.9} />
                </Link>
            </div>

            <div className="relative mt-4 shrink-0">
                {/* Linha de ligação por trás dos círculos — comprimento
                    fixo relativo aos centros das colunas 1 e 3 (cada
                    coluna tem 1/3 da largura, por isso os centros ficam
                    a 1/6 e 5/6). Os círculos têm fundo opaco para a
                    tapar por cima. */}
                <div className="absolute left-[16.6%] right-[16.6%] top-4 h-px bg-slate-200 dark:bg-[#2a5069]" />

                <div className="relative z-10 grid grid-cols-3">
                    {passos.map((passo) => (
                        <div
                            key={passo.numero}
                            className="flex flex-col items-center gap-1.5"
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                    passo.numero === passoAtual
                                        ? 'bg-teal-500 text-white dark:bg-[#18c3b3]'
                                        : 'border-2 border-slate-200 bg-white text-slate-400 dark:border-[#2a5069] dark:bg-[#163a56] dark:text-[#8fa7bd]'
                                }`}
                            >
                                {passo.numero}
                            </span>

                            <span
                                className={`whitespace-nowrap text-[11px] font-bold ${
                                    passo.numero === passoAtual
                                        ? 'text-teal-700 dark:text-[#18c3b3]'
                                        : 'text-slate-400 dark:text-[#8fa7bd]'
                                }`}
                            >
                                {passo.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="mt-4 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8fa7bd]">
                Setores disponíveis
            </p>

            <div className="spacehub-scroll mt-2.5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {setores.map((setor) => (
                    <button
                        key={setor.id}
                        type="button"
                        onClick={() => onSelecionarSetor?.(setor)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-[0_1px_3px_rgba(15,42,67,0.04)] transition hover:-translate-y-0.5 hover:border-teal-400/50 hover:shadow-[0_8px_16px_rgba(15,42,67,0.08)] dark:border-[#2a5069]/60 dark:bg-[#101f34]"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-bold leading-snug text-slate-900 dark:text-[#f8fafc]">
                                    {setor.nome}
                                </span>

                                {setor.id === maiorSetorId && (
                                    <span className="shrink-0 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                                        Mais opções
                                    </span>
                                )}
                            </div>

                            <p className="mt-0.5 text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                                {setor.livres} livres de{' '}
                                {setor.total}
                            </p>

                            <BarraDisponibilidadeSetor
                                livres={setor.livres}
                                reservadas={setor.reservadas}
                                total={setor.total}
                            />
                        </div>

                        <ChevronRight
                            size={18}
                            strokeWidth={2}
                            className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-teal-500 dark:text-[#3d5a75]"
                        />
                    </button>
                ))}
            </div>

            <div className="mt-3 flex shrink-0 items-start gap-2.5 rounded-xl bg-teal-500/10 px-3.5 py-2.5 dark:bg-[#18c3b3]/10">
                <MapPin
                    size={15}
                    strokeWidth={1.9}
                    className="mt-0.5 shrink-0 text-teal-600 dark:text-[#18c3b3]"
                />
                <p className="text-[11px] leading-relaxed text-teal-700 dark:text-[#18c3b3]">
                    Ao escolher um setor, as secretárias disponíveis
                    aparecem no mapa.
                </p>
            </div>
        </aside>
    );
}

/**
 * Passo 2 da "Reserva rápida" — quando um setor já está escolhido mas
 * nenhuma secretária ainda. Mesma linguagem visual do passo 1
 * (SetoresDoPisoPanel), com o passo 1 marcado como concluído e
 * instruções de como continuar diretamente no mapa.
 */
function SetorSelecionadoPanel({ setor, piso, onAlterarSetor }) {
    const secretarias = setor.secretarias ?? [];
    const total = secretarias.length;
    const contagem = secretarias.reduce(
        (totais, secretaria) => {
            const estado = estadoNormalizado(secretaria.status);

            if (
                Object.prototype.hasOwnProperty.call(totais, estado)
            ) {
                totais[estado] += 1;
            }

            return totais;
        },
        { livre: 0, reservada: 0, ocupada: 0, indisponivel: 0 },
    );

    return (
        <aside className="dashboard-card flex h-[460px] flex-col p-5 sm:h-[550px] xl:h-[585px]">
            <div className="flex shrink-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-[#18c3b3]">
                        Reserva rápida
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
                        Escolha uma secretária
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-[#8fa7bd]">
                        As secretárias de {setor.nome} estão
                        visíveis no mapa.
                    </p>
                </div>

                <Link
                    href={route('faqs.index')}
                    title="Ajuda"
                    aria-label="Ajuda"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-teal-400 hover:text-teal-600 dark:border-[#2a5069] dark:text-[#8fa7bd]"
                >
                    <HelpCircle size={16} strokeWidth={1.9} />
                </Link>
            </div>

            <div className="relative mt-4 shrink-0">
                <div className="absolute left-[16.6%] right-[16.6%] top-4 h-px bg-slate-200 dark:bg-[#2a5069]" />
                <div className="absolute left-[16.6%] top-4 h-px w-1/3 bg-teal-500 dark:bg-[#18c3b3]" />

                <div className="relative z-10 grid grid-cols-3">
                    <div className="flex flex-col items-center gap-1.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white dark:bg-[#18c3b3]">
                            <Check size={16} strokeWidth={2.5} />
                        </span>
                        <span className="whitespace-nowrap text-[11px] font-bold text-teal-700 dark:text-[#18c3b3]">
                            Setor
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white dark:bg-[#18c3b3]">
                            2
                        </span>
                        <span className="whitespace-nowrap text-[11px] font-bold text-teal-700 dark:text-[#18c3b3]">
                            Secretária
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-sm font-bold text-slate-400 dark:border-[#2a5069] dark:bg-[#163a56] dark:text-[#8fa7bd]">
                            3
                        </span>
                        <span className="whitespace-nowrap text-[11px] font-bold text-slate-400 dark:text-[#8fa7bd]">
                            Reservar
                        </span>
                    </div>
                </div>
            </div>

            <p className="mt-4 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8fa7bd]">
                Setor selecionado
            </p>

            <div className="mt-2.5 shrink-0 rounded-2xl border border-teal-500/20 bg-teal-500/[0.04] p-3.5 dark:border-[#18c3b3]/20 dark:bg-[#18c3b3]/[0.06]">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-600 dark:bg-[#101f34] dark:text-[#18c3b3]">
                        <MapPin size={17} strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                            {setor.nome}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                            {piso?.nome} · {contagem.livre} de{' '}
                            {total} livres
                        </p>
                    </div>
                </div>

                <BarraDisponibilidadeSetor
                    livres={contagem.livre}
                    reservadas={contagem.reservada}
                    total={total}
                />

                <button
                    type="button"
                    onClick={onAlterarSetor}
                    className="mt-2.5 text-xs font-bold text-teal-700 transition hover:text-teal-800 dark:text-[#18c3b3] dark:hover:text-[#5eead4]"
                >
                    ← Alterar setor
                </button>
            </div>

            <p className="mt-4 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8fa7bd]">
                Escolha no mapa
            </p>

            <div className="mt-2.5 flex-1 space-y-3">
                <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <Armchair size={16} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-[#f8fafc]">
                            Selecione uma secretária numerada
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-[#8fa7bd]">
                            Clique num número turquesa para
                            consultar os detalhes e a
                            disponibilidade.
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-[#8fa7bd]">
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-[#18c3b3]" />
                                Livre
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                Reservada
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                Ocupada
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-[#3d5a75]" />
                                Indisponível
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex shrink-0 items-start gap-2.5 rounded-xl bg-teal-500/10 px-3.5 py-2.5 dark:bg-[#18c3b3]/10">
                <Info
                    size={15}
                    strokeWidth={1.9}
                    className="mt-0.5 shrink-0 text-teal-600 dark:text-[#18c3b3]"
                />
                <p className="text-[11px] leading-relaxed text-teal-700 dark:text-[#18c3b3]">
                    Depois de escolher a secretária, clique em
                    Reservar agora para continuar.
                </p>
            </div>
        </aside>
    );
}

function OcupacaoRing() {
    return (
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
            <Armchair size={22} strokeWidth={1.8} />

            <Sparkles
                size={13}
                strokeWidth={2}
                className="absolute -right-1 -top-1 text-teal-400"
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
        <aside className="dashboard-card flex h-[460px] flex-col justify-between overflow-hidden p-5 sm:h-[550px] xl:h-[585px]">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#f8fafc]">
                        Visão geral
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-[#183f5d] dark:text-[#b5c5d5]">
                        {floorName ?? 'Piso'}
                    </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-[#b5c5d5]">
                    {total} secretárias
                </p>
            </div>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-4xl font-extrabold text-teal-500 dark:text-[#18c3b3]">
                        {percentualOcupacao}%
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-[#d7e3ed]">
                        Ocupação atual
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-[#8fa7bd]">
                        {emUtilizacao} reservadas ou ocupadas
                    </p>
                </div>

                <OcupacaoRing />
            </div>

            <div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#101f34]">
                    {linhas.map((linha) => (
                        <span
                            key={linha.chave}
                            style={{
                                width: `${percentual(linha.valor)}%`,
                                background:
                                    GRADIENTES_BARRA_CSS[
                                        linha.chave
                                    ],
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
                                className={`text-sm font-bold ${CORES_TEXTO[linha.chave]}`}
                            >
                                {percentual(linha.valor)}%
                            </span>
                        ))}
                </div>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-[#2a5069]/60 dark:border-[#2a5069]/60">
                {linhas.map((linha) => (
                    <div
                        key={linha.chave}
                        className="flex items-center gap-2 py-3 text-sm"
                    >
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${OVERVIEW_CORES[linha.chave].dot}`}
                        />

                        <span className="flex-1 text-slate-500 dark:text-[#b5c5d5]">
                            {linha.label}
                        </span>

                        <span className="font-bold text-slate-900 dark:text-[#f8fafc]">
                            {linha.valor}
                        </span>

                        <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-400 dark:text-[#8fa7bd]">
                            {percentual(linha.valor)}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 dark:border-[#18c3b3]/25 dark:bg-[#183f5d]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                    <MapPin size={16} strokeWidth={1.8} />
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-[#d7e3ed]">
                    Selecione um setor no mapa para ver os detalhes.
                </p>
            </div>
        </aside>
    );
}
