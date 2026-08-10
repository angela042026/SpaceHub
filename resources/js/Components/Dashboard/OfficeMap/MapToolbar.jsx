import { useEffect, useRef } from 'react';
import {
    Check,
    Expand,
    RotateCcw,
    RotateCw,
    Search,
    SlidersHorizontal,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

import { FILTROS, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from './mapUtils';

// Atalho real: Ctrl/Cmd+K foca a pesquisa — a dica "Ctrl K" só é
// mostrada porque este listener existe de facto, não é decorativa.
const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);

export default function MapToolbar({
    edificios,
    selectedEdificio,
    setSelectedEdificio,
    pisos,
    selectedFloor,
    setSelectedFloor,
    pesquisa,
    setPesquisa,
    filtro,
    setFiltro,
    filtrosAbertos,
    setFiltrosAbertos,
    rotacao,
    setRotacao,
    zoom,
    onZoom,
    onReset,
    onFullscreen,
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        function handleKeyDown(event) {
            const teclaAtalho = isMac ? event.metaKey : event.ctrlKey;

            if (teclaAtalho && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#e6edf5] bg-[#f8fafc] p-2 xl:flex-row xl:items-center xl:justify-between dark:border-[#2a5069] dark:bg-[#101f34]">
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-xl p-0.5">
                {pisos.map((piso) => {
                    const ativo =
                        String(piso.codigo) ===
                        String(selectedFloor);

                    return (
                        <button
                            key={piso.id}
                            type="button"
                            onClick={() =>
                                setSelectedFloor?.(
                                    piso.codigo,
                                )
                            }
                            className={`relative h-10 min-w-[74px] rounded-lg px-4 text-sm font-bold transition ${
                                ativo
                                    ? 'bg-teal-600 text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]'
                                    : 'text-slate-600 hover:bg-white/70 dark:text-[#b5c5d5] dark:hover:bg-[#183f5d]'
                            }`}
                        >
                            {Number(piso.numero) === -1
                                ? `Piso ${piso.numero}`
                                : piso.nome}

                            {ativo && (
                                <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-white/70" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                {edificios.length > 1 && (
                    <select
                        value={selectedEdificio}
                        onChange={(event) =>
                            setSelectedEdificio?.(
                                event.target.value,
                            )
                        }
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#f8fafc]"
                        aria-label="Selecionar edifício"
                    >
                        {edificios.map((edificio) => (
                            <option
                                key={edificio.id}
                                value={edificio.id}
                            >
                                {edificio.nome}
                            </option>
                        ))}
                    </select>
                )}

                <div className="relative min-w-[260px] flex-1 xl:max-w-[300px]">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8fa7bd]"
                    />

                    <input
                        ref={inputRef}
                        type="search"
                        value={pesquisa}
                        onChange={(event) =>
                            setPesquisa(event.target.value)
                        }
                        placeholder="Pesquisar secretária..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#f8fafc] dark:placeholder-[#8fa7bd] dark:focus:border-[#18c3b3] dark:focus:ring-[#18c3b3]/15"
                    />

                    {pesquisa && (
                        <button
                            type="button"
                            onClick={() => setPesquisa('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:text-[#8fa7bd] dark:hover:bg-[#183f5d]"
                            aria-label="Limpar pesquisa"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <ToolbarButton
                        icon={SlidersHorizontal}
                        label="Filtrar"
                        active={filtro !== 'todos'}
                        onClick={() =>
                            setFiltrosAbertos(
                                (aberto) => !aberto,
                            )
                        }
                    />

                    {filtrosAbertos && (
                        <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-[#2a5069] dark:bg-[#101f34]">
                            {FILTROS.map(
                                ([valor, label]) => (
                                    <button
                                        key={valor}
                                        type="button"
                                        onClick={() => {
                                            setFiltro(valor);
                                            setFiltrosAbertos(
                                                false,
                                            );
                                        }}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                                            filtro === valor
                                                ? 'bg-teal-500/10 text-teal-600'
                                                : 'text-slate-600 hover:bg-slate-50 dark:text-[#b5c5d5] dark:hover:bg-[#183f5d]'
                                        }`}
                                    >
                                        {label}
                                        {filtro === valor && (
                                            <Check size={14} />
                                        )}
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </div>

                <ToolbarButton
                    icon={RotateCw}
                    label="Girar"
                    onClick={() =>
                        setRotacao((rotacao + 90) % 360)
                    }
                />

                <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#2a5069] dark:bg-[#101f34]">
                    <IconButton
                        icon={ZoomOut}
                        label="Diminuir zoom"
                        disabled={zoom <= MIN_ZOOM}
                        onClick={() => onZoom(-ZOOM_STEP)}
                    />
                    <span className="flex min-w-12 items-center justify-center border-x border-slate-200 px-2 text-[11px] font-bold text-slate-500 dark:border-[#2a5069] dark:text-[#8fa7bd]">
                        {Math.round(zoom * 100)}%
                    </span>
                    <IconButton
                        icon={ZoomIn}
                        label="Aumentar zoom"
                        disabled={zoom >= MAX_ZOOM}
                        onClick={() => onZoom(ZOOM_STEP)}
                    />
                </div>

                <ToolbarButton
                    icon={RotateCcw}
                    label="Resetar"
                    onClick={onReset}
                />

                <IconButtonBox
                    icon={Expand}
                    label="Ecrã inteiro"
                    onClick={onFullscreen}
                />
            </div>
        </div>
    );
}

function ToolbarButton({
    icon: Icon,
    label,
    onClick,
    active = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
                active
                    ? 'border-teal-500 bg-teal-500/10 text-teal-600'
                    : 'border-transparent bg-white text-slate-600 shadow-sm hover:border-teal-500 hover:text-teal-600 dark:bg-[#101f34] dark:text-slate-300'
            }`}
        >
            <Icon size={16} />
            <span className="hidden 2xl:inline">
                {label}
            </span>
        </button>
    );
}

function IconButton({
    icon: Icon,
    label,
    onClick,
    disabled,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="flex w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-teal-600 disabled:opacity-30 dark:text-[#b5c5d5] dark:hover:bg-[#183f5d]"
        >
            <Icon size={15} />
        </button>
    );
}

function IconButtonBox({ icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-teal-500 hover:text-teal-600 dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#b5c5d5]"
        >
            <Icon size={17} />
        </button>
    );
}
