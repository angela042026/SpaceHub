import { router } from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import DeskDetailPanel from './DeskDetailPanel';
import MapCanvas from './MapCanvas';
import MapToolbar from './MapToolbar';

import {
    correspondePesquisa,
    estadoNormalizado,
    limitarZoom,
    ZOOM_STEP,
} from './mapUtils';

function hojeLocal() {
    const agora = new Date();

    return [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, '0'),
        String(agora.getDate()).padStart(2, '0'),
    ].join('-');
}

export default function OfficeMap({
    pisos = [],
    edificios = [],
    selectedFloor,
    setSelectedFloor,
    selectedEdificio,
    setSelectedEdificio,
    mostrarTudo = false,
    showOverview = false,
    overviewData,
}) {
    const sectionRef = useRef(null);
    const dragStartRef = useRef(null);

    const [pesquisa, setPesquisa] = useState('');
    const [filtro, setFiltro] = useState('todos');
    const [filtrosAbertos, setFiltrosAbertos] =
        useState(false);
    const [selectedSecretaria, setSelectedSecretaria] =
        useState(null);
    const [selectedSetorId, setSelectedSetorId] =
        useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotacao, setRotacao] = useState(0);
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });
    const [isDragging, setIsDragging] = useState(false);

    const pisosDoEdificio = useMemo(
        () =>
            pisos.filter(
                (piso) =>
                    (mostrarTudo ||
                        Number(piso.numero) >= 0) &&
                    (!selectedEdificio ||
                        String(piso.edificio_id) ===
                            String(selectedEdificio)),
            ),
        [pisos, selectedEdificio, mostrarTudo],
    );

    const pisoAtual = useMemo(
        () =>
            pisosDoEdificio.find(
                (piso) =>
                    String(piso.codigo) ===
                    String(selectedFloor),
            ) ?? pisosDoEdificio[0],
        [pisosDoEdificio, selectedFloor],
    );

    const secretarias = useMemo(
        () =>
            (pisoAtual?.setores ?? []).flatMap(
                (setor) =>
                    (setor.secretarias ?? []).map(
                        (secretaria) => ({
                            ...secretaria,
                            setor,
                        }),
                    ),
            ),
        [pisoAtual],
    );

    const setoresInterativos = useMemo(
        () =>
            (pisoAtual?.setores ?? [])
                .map((setor) => {
                    const coordenadas = (
                        setor.secretarias ?? []
                    ).filter(
                        (secretaria) =>
                            secretaria.planta_x !== null &&
                            secretaria.planta_y !== null,
                    );

                    const temPosicaoPropria =
                        setor.planta_x !== null &&
                        setor.planta_x !== undefined &&
                        setor.planta_y !== null &&
                        setor.planta_y !== undefined;

                    // Setor sem secretárias posicionadas (ex: Copa,
                    // Sanitário) só entra no mapa completo, e só se tiver
                    // a sua própria posição guardada — sem secretárias não
                    // há como calcular um centro automaticamente.
                    if (
                        coordenadas.length === 0 &&
                        !(mostrarTudo && temPosicaoPropria)
                    ) {
                        return null;
                    }

                    const temPosicaoConfigurada =
                        (pisoAtual?.codigo !== 'P0' &&
                            temPosicaoPropria) ||
                        (mostrarTudo &&
                            coordenadas.length === 0 &&
                            temPosicaoPropria);
                    const usarPrimeiraSecretariaComoAncora =
                        coordenadas.length > 0 &&
                        pisoAtual?.codigo === 'P1' &&
                        ['E', 'SRG'].includes(setor.codigo);
                    const centroXCalculado =
                        usarPrimeiraSecretariaComoAncora
                            ? Number(
                                  coordenadas[0].planta_x,
                              )
                            : coordenadas.reduce(
                                  (total, secretaria) =>
                                      total +
                                      Number(
                                          secretaria.planta_x,
                                      ),
                                  0,
                              ) / coordenadas.length;
                    const centroYCalculado =
                        usarPrimeiraSecretariaComoAncora
                            ? Number(
                                  coordenadas[0].planta_y,
                              ) - 5
                            : Math.min(
                                  ...coordenadas.map(
                                      (secretaria) =>
                                          Number(
                                              secretaria.planta_y,
                                          ),
                                  ),
                              ) - 5;
                    const recuoEtiquetaX =
                        !temPosicaoConfigurada &&
                        setor.tipo === 'phone_booth'
                            ? 5
                            : 0;

                    // Piso 2 precisa de um deslocamento menor do que os
                    // outros pisos com posição própria guardada.
                    const deslocamentoY =
                        pisoAtual?.codigo === 'P2' ? 3 : 5;

                    return {
                        ...setor,
                        centroX: Math.max(
                            5,
                            Math.min(
                                95,
                                (temPosicaoConfigurada
                                    ? Number(
                                          setor.planta_x,
                                      )
                                    : centroXCalculado) -
                                    recuoEtiquetaX,
                            ),
                        ),
                        centroY: Math.max(
                            5,
                            Math.min(
                                95,
                                temPosicaoConfigurada
                                    ? Number(
                                          setor.planta_y,
                                      ) - deslocamentoY
                                    : centroYCalculado,
                            ),
                        ),
                    };
                })
                .filter(Boolean),
        [pisoAtual, mostrarTudo],
    );

    const setorSelecionado = useMemo(
        () =>
            setoresInterativos.find(
                (setor) =>
                    String(setor.id) ===
                    String(selectedSetorId),
            ) ?? null,
        [setoresInterativos, selectedSetorId],
    );

    const secretariasFiltradas = useMemo(
        () =>
            secretarias.filter((secretaria) => {
                const correspondeAoTexto =
                    correspondePesquisa(
                        secretaria,
                        pesquisa,
                    );

                const correspondeAoEstado =
                    filtro === 'todos' ||
                    estadoNormalizado(
                        secretaria.status,
                    ) === filtro;

                return (
                    correspondeAoTexto &&
                    correspondeAoEstado &&
                    secretaria.planta_x !== null &&
                    secretaria.planta_y !== null
                );
            }),
        [secretarias, pesquisa, filtro],
    );

    const secretariasVisiveis = useMemo(() => {
        if (!selectedSetorId) {
            return [];
        }

        return secretariasFiltradas.filter(
            (secretaria) =>
                String(secretaria.setor?.id) ===
                String(selectedSetorId),
        );
    }, [secretariasFiltradas, selectedSetorId]);

    useEffect(() => {
        if (!pisoAtual) {
            return;
        }

        if (
            String(selectedFloor ?? '') !==
            String(pisoAtual.codigo)
        ) {
            setSelectedFloor?.(pisoAtual.codigo);
        }
    }, [pisoAtual, selectedFloor, setSelectedFloor]);

    useEffect(() => {
        setSelectedSecretaria(null);
        setSelectedSetorId(null);
        reporMapa();
    }, [pisoAtual?.id]);

    useEffect(() => {
        const termo = pesquisa.trim();

        if (!termo) {
            return;
        }

        const primeiraSecretaria =
            secretariasFiltradas[0] ?? null;

        setSelectedSetorId(
            primeiraSecretaria?.setor?.id ?? null,
        );
        setSelectedSecretaria(primeiraSecretaria);
    }, [pesquisa, secretariasFiltradas]);

    function selecionarSetor(setor) {
        const mesmoSetor =
            String(selectedSetorId) === String(setor.id);

        setSelectedSetorId(mesmoSetor ? null : setor.id);
        setSelectedSecretaria(null);
    }

    function reporMapa() {
        setZoom(1);
        setRotacao(0);
        setPosition({ x: 0, y: 0 });
    }

    function alterarZoom(valor) {
        setZoom((atual) =>
            limitarZoom(atual + valor),
        );
    }

    function handleWheel(event) {
        event.preventDefault();

        alterarZoom(
            event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP,
        );
    }

    function handlePointerDown(event) {
        if (
            event.button !== 0 ||
            event.target.closest(
                'button, input, select, [data-map-control="true"]',
            )
        ) {
            return;
        }

        dragStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            positionX: position.x,
            positionY: position.y,
        };

        setIsDragging(true);
        event.currentTarget.setPointerCapture?.(
            event.pointerId,
        );
    }

    function handlePointerMove(event) {
        if (!isDragging || !dragStartRef.current) {
            return;
        }

        setPosition({
            x:
                dragStartRef.current.positionX +
                event.clientX -
                dragStartRef.current.mouseX,
            y:
                dragStartRef.current.positionY +
                event.clientY -
                dragStartRef.current.mouseY,
        });
    }

    function terminarArrasto(event) {
        setIsDragging(false);
        dragStartRef.current = null;
        event.currentTarget.releasePointerCapture?.(
            event.pointerId,
        );
    }

    function reservarSecretaria(secretaria) {
        if (!secretaria?.setor || !pisoAtual) {
            return;
        }

        router.get(route('reservas.create'), {
            data: hojeLocal(),
            piso_id: pisoAtual.id,
            setor_id: secretaria.setor.id,
            secretaria_id: secretaria.id,
        });
    }

    async function alternarEcraInteiro() {
        if (!document.fullscreenElement) {
            await sectionRef.current?.requestFullscreen?.();
            return;
        }

        await document.exitFullscreen?.();
    }

    if (!pisoAtual) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            className="dashboard-card p-4 sm:p-5"
        >
            <MapToolbar
                edificios={edificios}
                selectedEdificio={selectedEdificio}
                setSelectedEdificio={setSelectedEdificio}
                pisos={pisosDoEdificio}
                selectedFloor={selectedFloor}
                setSelectedFloor={setSelectedFloor}
                pesquisa={pesquisa}
                setPesquisa={setPesquisa}
                filtro={filtro}
                setFiltro={setFiltro}
                filtrosAbertos={filtrosAbertos}
                setFiltrosAbertos={setFiltrosAbertos}
                rotacao={rotacao}
                setRotacao={setRotacao}
                zoom={zoom}
                onZoom={alterarZoom}
                onReset={reporMapa}
                onFullscreen={alternarEcraInteiro}
            />

            <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <MapCanvas
                    pisoAtual={pisoAtual}
                    setoresInterativos={
                        setoresInterativos
                    }
                    secretariasVisiveis={
                        secretariasVisiveis
                    }
                    selectedSetorId={selectedSetorId}
                    selectedSecretaria={
                        selectedSecretaria
                    }
                    setorSelecionado={setorSelecionado}
                    zoom={zoom}
                    rotacao={rotacao}
                    position={position}
                    isDragging={isDragging}
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={terminarArrasto}
                    onPointerCancel={terminarArrasto}
                    onSelecionarSetor={selecionarSetor}
                    onSelecionarSecretaria={
                        setSelectedSecretaria
                    }
                />

                <DeskDetailPanel
                    secretaria={selectedSecretaria}
                    setor={setorSelecionado}
                    piso={pisoAtual}
                    onClose={() =>
                        setSelectedSecretaria(null)
                    }
                    onReserve={reservarSecretaria}
                    showOverview={showOverview}
                    overview={
                        overviewData?.[pisoAtual?.codigo]
                    }
                />
            </div>
        </section>
    );
}
