import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Armchair,
    Building2,
    Layers3,
    MapPinned,
} from 'lucide-react';

import { LoadingBadge } from '@/Components/Loading';

import MapCanvas from './MapCanvas';
import MapToolbar from './MapToolbar';
import SectorList from './SectorList';
import SelectedSectorCard from './SelectedSectorCard';

import {
    normalizarEstadoFiltro,
    normalizarTexto,
    correspondeFiltro,
    correspondePesquisa,
} from './mapUtils';

export default function OfficeMap({
    pisos,
    selectedFloor,
    setSelectedFloor,
    edificios,
    selectedEdificio,
    setSelectedEdificio,
    variant = 'full',
}) {
    const isDashboard = variant === 'dashboard';

    const [selectedSector, setSelectedSector] =
        useState(null);

    const [selectedSecretaria, setSelectedSecretaria] =
        useState(null);

    const [atualizando, setAtualizando] =
        useState(false);

    const [pesquisa, setPesquisa] = useState('');

    const [filtroEstado, setFiltroEstado] =
        useState('todos');

    const larguraClass = isDashboard
        ? 'w-full'
        : 'mx-auto w-full max-w-5xl';

    const pisosDoEdificio = useMemo(
        () =>
            (pisos ?? []).filter((piso) => {
                const pertenceAoEdificio =
                    !selectedEdificio ||
                    String(piso.edificio_id) ===
                        String(selectedEdificio);

                const pisoVisivel =
                    isDashboard ||
                    Number(piso.numero) !== -1;

                return (
                    pertenceAoEdificio &&
                    pisoVisivel
                );
            }),
        [
            pisos,
            selectedEdificio,
            isDashboard,
        ],
    );

    const pisoAtual = useMemo(
        () =>
            pisosDoEdificio.find(
                (piso) =>
                    String(piso.codigo) ===
                    String(selectedFloor),
            ) ?? pisosDoEdificio[0],
        [
            pisosDoEdificio,
            selectedFloor,
        ],
    );

    useEffect(() => {
        if (pisosDoEdificio.length === 0) {
            return;
        }

        const aindaValido =
            pisosDoEdificio.some(
                (piso) =>
                    String(piso.codigo) ===
                    String(selectedFloor),
            );

        if (!aindaValido) {
            setSelectedFloor?.(
                pisosDoEdificio[0].codigo,
            );
        }
    }, [
        pisosDoEdificio,
        selectedFloor,
        setSelectedFloor,
    ]);

    const setores = useMemo(
        () => pisoAtual?.setores ?? [],
        [pisoAtual],
    );

    const setoresComPosicao = useMemo(
        () =>
            setores.filter((setor) => {
                const hasX =
                    setor.planta_x !== null &&
                    setor.planta_x !== undefined;

                const hasY =
                    setor.planta_y !== null &&
                    setor.planta_y !== undefined;

                return hasX && hasY;
            }),
        [setores],
    );

    const todasSecretarias = useMemo(
        () =>
            setores.flatMap((setor) =>
                (setor.secretarias ?? []).map(
                    (secretaria) => ({
                        ...secretaria,
                        setor,
                    }),
                ),
            ),
        [setores],
    );

    const contadores = useMemo(() => {
        return todasSecretarias.reduce(
            (totais, secretaria) => {
                totais.todos += 1;

                const estado =
                    normalizarEstadoFiltro(
                        secretaria.status,
                    );

                if (estado === 'livre') {
                    totais.livre += 1;
                }

                if (estado === 'reservada') {
                    totais.reservada += 1;
                }

                if (estado === 'ocupada') {
                    totais.ocupada += 1;
                }

                if (estado === 'indisponivel') {
                    totais.indisponivel += 1;
                }

                return totais;
            },
            {
                todos: 0,
                livre: 0,
                reservada: 0,
                ocupada: 0,
                indisponivel: 0,
            },
        );
    }, [todasSecretarias]);

    const secretariasFiltradasDoSetor =
        useMemo(() => {
            if (!selectedSector) {
                return [];
            }

            return (
                selectedSector.secretarias ?? []
            ).filter(
                (secretaria) =>
                    correspondePesquisa(
                        secretaria,
                        pesquisa,
                    ) &&
                    correspondeFiltro(
                        secretaria,
                        filtroEstado,
                    ),
            );
        }, [
            selectedSector,
            pesquisa,
            filtroEstado,
        ]);

    const setoresVisiveis = useMemo(() => {
        if (
            !pesquisa.trim() &&
            filtroEstado === 'todos'
        ) {
            return setoresComPosicao;
        }

        return setoresComPosicao.filter(
            (setor) =>
                (setor.secretarias ?? []).some(
                    (secretaria) =>
                        correspondePesquisa(
                            secretaria,
                            pesquisa,
                        ) &&
                        correspondeFiltro(
                            secretaria,
                            filtroEstado,
                        ),
                ),
        );
    }, [
        setoresComPosicao,
        pesquisa,
        filtroEstado,
    ]);

    const totalResultadosPesquisa =
        useMemo(() => {
            return todasSecretarias.filter(
                (secretaria) =>
                    correspondePesquisa(
                        secretaria,
                        pesquisa,
                    ) &&
                    correspondeFiltro(
                        secretaria,
                        filtroEstado,
                    ),
            ).length;
        }, [
            todasSecretarias,
            pesquisa,
            filtroEstado,
        ]);

    const totalSecretarias =
        pisoAtual?.totalSecretarias ??
        contadores.todos;

    const totalLivres = contadores.livre;

    const filtrosAtivos =
        pesquisa.trim() !== '' ||
        filtroEstado !== 'todos';

    useEffect(() => {
        setSelectedSector(null);
        setSelectedSecretaria(null);
        setPesquisa('');
        setFiltroEstado('todos');
    }, [
        selectedFloor,
        selectedEdificio,
    ]);

    useEffect(() => {
        if (!pisoAtual) {
            return;
        }

        const codigoPiso =
            String(pisoAtual.codigo);

        if (
            String(selectedFloor ?? '') !==
            codigoPiso
        ) {
            setSelectedFloor?.(codigoPiso);
        }
    }, [
        pisoAtual?.codigo,
        selectedFloor,
        setSelectedFloor,
    ]);

    useEffect(() => {
        if (!window.Echo) {
            return undefined;
        }

        const canal =
            window.Echo.channel('office-map');

        canal.listen('MapaAtualizado', () => {
            setAtualizando(true);

            router.reload({
                only: ['pisos', 'stats'],
                onFinish: () =>
                    setAtualizando(false),
            });
        });

        return () => {
            window.Echo.leaveChannel(
                'office-map',
            );
        };
    }, []);

    useEffect(() => {
        const termo = pesquisa.trim();

        if (!termo) {
            return;
        }

        const correspondencias =
            todasSecretarias.filter(
                (secretaria) =>
                    correspondePesquisa(
                        secretaria,
                        termo,
                    ) &&
                    correspondeFiltro(
                        secretaria,
                        filtroEstado,
                    ),
            );

        if (correspondencias.length === 0) {
            setSelectedSecretaria(null);
            return;
        }

        const pesquisaNormalizada =
            normalizarTexto(termo);

        const correspondenciaExata =
            correspondencias.find(
                (secretaria) =>
                    normalizarTexto(
                        secretaria.codigo,
                    ) ===
                        pesquisaNormalizada ||
                    normalizarTexto(
                        secretaria.numero,
                    ) ===
                        pesquisaNormalizada,
            ) ?? correspondencias[0];

        setSelectedSector(
            correspondenciaExata.setor,
        );

        setSelectedSecretaria(
            correspondenciaExata,
        );
    }, [
        pesquisa,
        filtroEstado,
        todasSecretarias,
    ]);

    function handleSectorClick(setor) {
        setSelectedSector((setorAtual) =>
            setorAtual?.id === setor.id
                ? null
                : setor,
        );

        setSelectedSecretaria(null);
    }

    function handleSecretariaClick(secretaria) {
        if (
            !pisoAtual ||
            !selectedSector
        ) {
            return;
        }

        setSelectedSecretaria(secretaria);

        const hoje = new Date()
            .toISOString()
            .slice(0, 10);

        router.get(
            route('reservas.create'),
            {
                data: hoje,
                piso_id: pisoAtual.id,
                setor_id: selectedSector.id,
                secretaria_id: secretaria.id,
            },
        );
    }

    function limparFiltros() {
        setPesquisa('');
        setFiltroEstado('todos');
        setSelectedSecretaria(null);
    }

    function fecharSetorSelecionado() {
        setSelectedSector(null);
        setSelectedSecretaria(null);
    }

    if (!pisoAtual) {
        return (
            <section
                className={`dashboard-card p-5 ${larguraClass}`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <MapPinned
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Mapa do Escritório
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Ainda não existem pisos
                            registados.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className={`dashboard-card overflow-hidden ${larguraClass}`}
        >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <MapPinned
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Mapa do Escritório
                            </h2>

                            <LoadingBadge
                                show={atualizando}
                                label="A atualizar"
                            />
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Building2
                                    size={13}
                                    strokeWidth={1.9}
                                />

                                {pisoAtual.edificio_nome ??
                                    'SpaceHub'}
                            </span>

                            <span className="text-slate-300 dark:text-slate-700">
                                •
                            </span>

                            <span className="flex items-center gap-1">
                                <Layers3
                                    size={13}
                                    strokeWidth={1.9}
                                />

                                {pisoAtual.nome}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <MapToolbar
                edificios={edificios}
                selectedEdificio={selectedEdificio}
                setSelectedEdificio={
                    setSelectedEdificio
                }
                pisosDoEdificio={
                    pisosDoEdificio
                }
                selectedFloor={selectedFloor}
                setSelectedFloor={
                    setSelectedFloor
                }
                pesquisa={pesquisa}
                setPesquisa={setPesquisa}
                filtroEstado={filtroEstado}
                setFiltroEstado={
                    setFiltroEstado
                }
                contadores={contadores}
                filtrosAtivos={filtrosAtivos}
                setoresVisiveis={
                    setoresVisiveis
                }
                totalResultadosPesquisa={
                    totalResultadosPesquisa
                }
                onClearFilters={limparFiltros}
                isDashboard={isDashboard}
            />

            {!isDashboard && (
                <div className="grid grid-cols-2 gap-2 px-4 pt-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Secretárias
                        </p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <Armchair
                                size={15}
                                strokeWidth={1.9}
                                className="text-teal-500"
                            />

                            <strong className="text-lg text-slate-900 dark:text-white">
                                {totalSecretarias}
                            </strong>
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Livres
                        </p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-status-livre" />

                            <strong className="text-lg text-slate-900 dark:text-white">
                                {totalLivres}
                            </strong>
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60 sm:col-span-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Setores
                        </p>

                        <strong className="mt-0.5 block text-lg text-slate-900 dark:text-white">
                            {setores.length}
                        </strong>
                    </div>
                </div>
            )}

            <MapCanvas
                pisoAtual={pisoAtual}
                setoresVisiveis={
                    setoresVisiveis
                }
                selectedSector={
                    selectedSector
                }
                secretariasFiltradasDoSetor={
                    secretariasFiltradasDoSetor
                }
                selectedSecretaria={
                    selectedSecretaria
                }
                pesquisa={pesquisa}
                expandido={isDashboard}
                onSectorClick={
                    handleSectorClick
                }
                onSecretariaClick={
                    handleSecretariaClick
                }
            />

            {!isDashboard && (
                <>
                    <SelectedSectorCard
                        selectedSector={
                            selectedSector
                        }
                        selectedSecretaria={
                            selectedSecretaria
                        }
                        onClose={
                            fecharSetorSelecionado
                        }
                    />

                    <SectorList
                        setoresVisiveis={
                            setoresVisiveis
                        }
                        totalSetores={
                            setores.length
                        }
                        selectedSector={
                            selectedSector
                        }
                        onSectorClick={
                            handleSectorClick
                        }
                        onClearFilters={
                            limparFiltros
                        }
                    />
                </>
            )}
        </section>
    );
}
