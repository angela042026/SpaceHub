import {
    Building2,
    ChevronDown,
    Layers3,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';

import { FILTROS } from './mapUtils';

export default function MapToolbar({
    edificios,
    selectedEdificio,
    setSelectedEdificio,
    pisosDoEdificio,
    selectedFloor,
    setSelectedFloor,
    pesquisa,
    setPesquisa,
    filtroEstado,
    setFiltroEstado,
    contadores,
    filtrosAtivos,
    setoresVisiveis,
    totalResultadosPesquisa,
    onClearFilters,
    isDashboard = false,
}) {
    return (
        <div
            className={`border-b border-slate-100 dark:border-slate-800 ${
                isDashboard
                    ? 'bg-slate-50/50 px-4 py-3 dark:bg-slate-950/20'
                    : 'bg-slate-50/60 px-4 py-4 dark:bg-slate-950/20'
            }`}
        >
            {/* Pesquisa e seletores */}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={17}
                        strokeWidth={1.9}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="search"
                        value={pesquisa}
                        onChange={(event) =>
                            setPesquisa?.(event.target.value)
                        }
                        placeholder="Pesquisar secretária..."
                        aria-label="Pesquisar secretária"
                        className={`w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-teal-500/40 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                            isDashboard ? 'h-10' : 'h-11'
                        }`}
                    />

                    {pesquisa && (
                        <button
                            type="button"
                            onClick={() => setPesquisa?.('')}
                            aria-label="Limpar pesquisa"
                            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                    {edificios?.length > 1 && (
                        <div className="relative w-full sm:w-[210px]">
                            <Building2
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-500"
                            />

                            <select
                                value={String(
                                    selectedEdificio ?? '',
                                )}
                                onChange={(event) =>
                                    setSelectedEdificio?.(
                                        event.target.value,
                                    )
                                }
                                aria-label="Selecionar edifício"
                                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                {edificios.map((edificio) => (
                                    <option
                                        key={edificio.id}
                                        value={String(edificio.id)}
                                    >
                                        {edificio.nome}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    )}

                    <div className="relative w-full sm:w-[220px]">
                        <Layers3
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-500"
                        />

                        <select
                            value={selectedFloor}
                            onChange={(event) =>
                                setSelectedFloor?.(
                                    event.target.value,
                                )
                            }
                            aria-label="Selecionar piso"
                            className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            {pisosDoEdificio.map((piso) => (
                                <option
                                    key={piso.id}
                                    value={piso.codigo}
                                >
                                    {piso.nome}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="mt-3 flex flex-col gap-2">
                {!isDashboard && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <SlidersHorizontal
                            size={15}
                            strokeWidth={1.9}
                        />

                        <span>
                            {filtrosAtivos
                                ? `${setoresVisiveis.length} setor(es) com resultados`
                                : 'Filtra as secretárias por estado'}
                        </span>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {Object.entries(FILTROS).map(
                        ([valor, filtro]) => {
                            const ativo =
                                filtroEstado === valor;

                            return (
                                <button
                                    key={valor}
                                    type="button"
                                    onClick={() =>
                                        setFiltroEstado?.(valor)
                                    }
                                    aria-pressed={ativo}
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
                                        ativo
                                            ? filtro.active
                                            : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-teal-500/40 hover:bg-teal-50/50 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-500/50 dark:hover:bg-teal-500/10 dark:hover:text-teal-400'
                                    }`}
                                >
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            filtro.dot
                                        } ${
                                            ativo
                                                ? 'ring-2 ring-white/50'
                                                : ''
                                        }`}
                                    />

                                    <span>{filtro.label}</span>

                                    <span
                                        className={`min-w-[22px] rounded-full px-2 py-0.5 text-center text-[10px] leading-4 ${
                                            ativo
                                                ? 'bg-white/20 text-current'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                    >
                                        {contadores?.[valor] ?? 0}
                                    </span>
                                </button>
                            );
                        },
                    )}

                    {filtrosAtivos && (
                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <X size={14} />
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {pesquisa && totalResultadosPesquisa === 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    Não foi encontrada nenhuma secretária com a
                    pesquisa “{pesquisa}”.
                </div>
            )}
        </div>
    );
}
