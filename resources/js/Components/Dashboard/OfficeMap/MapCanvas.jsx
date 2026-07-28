import { useCallback, useRef, useState } from 'react';

import {
    LocateFixed,
    MapPinned,
    Minus,
    Plus,
} from 'lucide-react';

import DeskMarker from './DeskMarker';
import SectorMarker from './SectorMarker';
import { correspondePesquisa } from './mapUtils';

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

function limitarZoom(valor) {
    return Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, valor),
    );
}

export default function MapCanvas({
    pisoAtual,
    setoresVisiveis,
    selectedSector,
    secretariasFiltradasDoSetor,
    selectedSecretaria,
    pesquisa,
    expandido,
    onSectorClick,
    onSecretariaClick,
}) {
    const viewportRef = useRef(null);

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        positionX: 0,
        positionY: 0,
    });

    const [zoom, setZoom] = useState(1);

    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const [isDragging, setIsDragging] =
        useState(false);

    const alterarZoom = useCallback((novoZoom) => {
        setZoom(limitarZoom(novoZoom));
    }, []);

    function aumentarZoom() {
        alterarZoom(zoom + ZOOM_STEP);
    }

    function diminuirZoom() {
        alterarZoom(zoom - ZOOM_STEP);
    }

    function reporMapa() {
        setZoom(1);

        setPosition({
            x: 0,
            y: 0,
        });
    }

    function handleWheel(event) {
        event.preventDefault();

        const direcao =
            event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;

        setZoom((zoomAtual) =>
            limitarZoom(zoomAtual + direcao),
        );
    }

    function handlePointerDown(event) {
        if (event.button !== 0) {
            return;
        }

        const elementoClicado = event.target;

        if (
            elementoClicado instanceof Element &&
            elementoClicado.closest(
                'button, a, input, select, textarea, [data-map-control="true"]',
            )
        ) {
            return;
        }

        setIsDragging(true);

        dragStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            positionX: position.x,
            positionY: position.y,
        };

        event.currentTarget.setPointerCapture?.(
            event.pointerId,
        );
    }

    function handlePointerMove(event) {
        if (!isDragging) {
            return;
        }

        const diferencaX =
            event.clientX -
            dragStartRef.current.mouseX;

        const diferencaY =
            event.clientY -
            dragStartRef.current.mouseY;

        setPosition({
            x:
                dragStartRef.current.positionX +
                diferencaX,
            y:
                dragStartRef.current.positionY +
                diferencaY,
        });
    }

    function terminarArrasto(event) {
        if (!isDragging) {
            return;
        }

        setIsDragging(false);

        event.currentTarget.releasePointerCapture?.(
            event.pointerId,
        );
    }

    return (
        <div className="px-4 py-3">
            <div
                ref={viewportRef}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={terminarArrasto}
                onPointerCancel={terminarArrasto}
                className={`relative mx-auto h-[430px] w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/70 shadow-inner select-none touch-none dark:border-slate-800 dark:bg-slate-950/40 ${isDragging
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                    }`}
            >
                {/* Controlos de zoom */}
                <div
                    data-map-control="true"
                    className="absolute right-3 top-3 z-50 flex flex-col gap-2"
                >
                    <button
                        type="button"
                        onClick={aumentarZoom}
                        disabled={zoom >= MAX_ZOOM}
                        aria-label="Aumentar zoom"
                        title="Aumentar zoom"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-400"
                    >
                        <Plus
                            size={18}
                            strokeWidth={2.2}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={diminuirZoom}
                        disabled={zoom <= MIN_ZOOM}
                        aria-label="Diminuir zoom"
                        title="Diminuir zoom"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-400"
                    >
                        <Minus
                            size={18}
                            strokeWidth={2.2}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={reporMapa}
                        aria-label="Repor mapa"
                        title="Repor mapa"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-400"
                    >
                        <LocateFixed
                            size={18}
                            strokeWidth={2}
                        />
                    </button>
                </div>

                {/* Indicador do zoom */}
                <div
                    data-map-control="true"
                    className="absolute bottom-3 right-3 z-50 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300"
                >
                    {Math.round(zoom * 100)}%
                </div>

                {/* Informação de utilização */}
                <div
                    data-map-control="true"
                    className="absolute bottom-3 left-3 z-50 hidden rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-medium text-slate-500 shadow-md backdrop-blur sm:block dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400"
                >
                    Usa a roda para ampliar e arrasta o mapa
                </div>

                {/* Conteúdo móvel */}
                <div
                    className="absolute left-1/2 top-1/2 origin-center transition-transform duration-100"
                    style={{
                        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }}
                >
                    <div className="relative w-fit rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        {pisoAtual.planta ? (
                            <img
                                src={pisoAtual.planta}
                                alt={`Planta do ${pisoAtual.nome}`}
                                draggable={false}
                                className="pointer-events-none mx-auto max-h-[390px] w-auto max-w-none object-contain"
                            />
                        ) : (
                            <div className="flex h-[320px] w-[680px] max-w-full flex-col items-center justify-center gap-3 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200/60 text-slate-400 dark:bg-slate-800">
                                    <MapPinned
                                        size={23}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Planta não disponível
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Este piso ainda não tem
                                        uma planta associada.
                                    </p>
                                </div>
                            </div>
                        )}

                        {setoresVisiveis
                            .filter(
                                (setor) =>
                                    setor.id !==
                                    selectedSector?.id,
                            )
                            .map((setor) => (
                                <SectorMarker
                                    key={setor.id}
                                    setor={setor}
                                    onClick={
                                        onSectorClick
                                    }
                                />
                            ))}

                        {secretariasFiltradasDoSetor.map(
                            (secretaria) => (
                                <DeskMarker
                                    key={secretaria.id}
                                    secretaria={
                                        secretaria
                                    }
                                    expandido={expandido}
                                    isSelected={
                                        selectedSecretaria?.id ===
                                        secretaria.id
                                    }
                                    isSearchResult={
                                        pesquisa.trim() !==
                                        '' &&
                                        correspondePesquisa(
                                            secretaria,
                                            pesquisa,
                                        )
                                    }
                                    onClick={
                                        onSecretariaClick
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
