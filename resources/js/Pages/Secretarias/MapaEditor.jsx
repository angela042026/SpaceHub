import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronRight,
    Loader2,
    Map as MapIcon,
    Maximize2,
    Minimize2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import { formatarNomePiso } from '@/utils/formatarNomePiso';

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2;
const ZOOM_PASSO = 0.1;

export default function MapaEditor({ pisos }) {
    const { t } = useTranslation('admin');

    const PASSOS = [
        t('mapaEditor.passos.selecionaZona'),
        t('mapaEditor.passos.clicaNaPlanta'),
        t('mapaEditor.passos.guardadaAutomaticamente'),
    ];

    const rotuloLugares = (numero) =>
        t('mapaEditor.lugares', { count: numero });

    const [dadosPisos, setDadosPisos] = useState(pisos);
    const [pisoSelecionado, setPisoSelecionado] = useState(pisos?.[0]?.codigo ?? '');
    const [setorAtivo, setSetorAtivo] = useState(null);
    const [zonaExpandidaId, setZonaExpandidaId] = useState(null);
    const [secretariaAtiva, setSecretariaAtiva] = useState(null);
    const [guardadoId, setGuardadoId] = useState(null);

    // Reflete sempre o pedido real ao backend — nunca uma confirmação
    // otimista antes da resposta chegar.
    const [estadoGravacao, setEstadoGravacao] = useState('idle');
    const [mensagemErro, setMensagemErro] = useState(null);
    const [mostrarToast, setMostrarToast] = useState(false);

    const [zoom, setZoom] = useState(1);
    const [emEcraCompleto, setEmEcraCompleto] = useState(false);

    const itemAtivoRef = useRef(null);

    const piso = useMemo(
        () => dadosPisos?.find((p) => p.codigo === pisoSelecionado) ?? dadosPisos?.[0],
        [dadosPisos, pisoSelecionado],
    );

    const zonaExpandida = useMemo(
        () => piso?.setores?.find((s) => s.id === zonaExpandidaId) ?? null,
        [piso, zonaExpandidaId],
    );

    useEffect(() => {
        if (estadoGravacao !== 'guardado') {
            return;
        }

        setMostrarToast(true);
        const temporizador = setTimeout(() => setMostrarToast(false), 2500);

        return () => clearTimeout(temporizador);
        // guardadoId muda a cada gravação bem-sucedida — reinicia o toast
        // mesmo que o estado continue "guardado" de uma posição para a outra.
    }, [estadoGravacao, guardadoId]);

    // Faz scroll até ao item selecionado (zona ou secretária) sempre que a
    // seleção muda — evita que o item fique escondido fora da área visível
    // da lista, mesmo depois de se navegar por outras zonas.
    useEffect(() => {
        itemAtivoRef.current?.scrollIntoView({ block: 'nearest' });
    }, [setorAtivo?.id, secretariaAtiva?.id]);

    function selecionarSetor(setor) {
        setSetorAtivo(setor);
        setSecretariaAtiva(null);
    }

    function alternarExpandirZona(event, setor) {
        event.stopPropagation();

        setZonaExpandidaId((atual) => {
            const estaExpandida = atual === setor.id;
            const temSecretariaAtivaNestaZona = setor.secretarias?.some(
                (secretaria) => secretaria.id === secretariaAtiva?.id,
            );

            // Não fecha o grupo enquanto uma secretária dele estiver
            // selecionada — evita esconder o item que está a ser
            // posicionado.
            if (estaExpandida && temSecretariaAtivaNestaZona) {
                return atual;
            }

            return estaExpandida ? null : setor.id;
        });
    }

    function selecionarSecretaria(setor, secretaria) {
        setSecretariaAtiva(secretaria);
        setSetorAtivo(null);
        // Garante que a zona-mãe está sempre aberta quando a secretária é
        // selecionada, mesmo que a seleção não tenha vindo de um clique na
        // lista já expandida.
        setZonaExpandidaId(setor.id);
    }

    function alterarZoom(delta) {
        setZoom((atual) => {
            const novo = Math.round((atual + delta) * 100) / 100;

            return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, novo));
        });
    }

    async function colocarNaPlanta(event) {
        if (!piso || (!setorAtivo && !secretariaAtiva)) {
            return;
        }

        // O rect é medido no próprio elemento com o transform de zoom
        // aplicado, por isso já reflete o tamanho visual real da imagem em
        // qualquer nível de zoom — a percentagem não precisa de compensar a
        // escala à parte, mantendo o formato de coordenadas inalterado.
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
        const xClamped = Math.min(Math.max(x, 0), 100);
        const yClamped = Math.min(Math.max(y, 0), 100);

        setEstadoGravacao('a-guardar');
        setMensagemErro(null);

        try {
            if (secretariaAtiva) {
                await axios.patch(route('secretarias.posicao.update', secretariaAtiva.id), {
                    planta_x: xClamped,
                    planta_y: yClamped,
                });

                setDadosPisos((atual) =>
                    atual.map((p) =>
                        p.id !== piso.id
                            ? p
                            : {
                                  ...p,
                                  setores: p.setores.map((s) =>
                                      s.id !== zonaExpandidaId
                                          ? s
                                          : {
                                                ...s,
                                                secretarias: s.secretarias.map((sec) =>
                                                    sec.id === secretariaAtiva.id
                                                        ? { ...sec, planta_x: xClamped, planta_y: yClamped }
                                                        : sec,
                                                ),
                                            },
                                  ),
                              },
                    ),
                );

                setGuardadoId(`secretaria-${secretariaAtiva.id}`);
            } else {
                await axios.patch(route('setores.posicao.update', setorAtivo.id), {
                    planta_x: xClamped,
                    planta_y: yClamped,
                });

                setDadosPisos((atual) =>
                    atual.map((p) =>
                        p.id !== piso.id
                            ? p
                            : {
                                  ...p,
                                  setores: p.setores.map((s) =>
                                      s.id === setorAtivo.id
                                          ? { ...s, planta_x: xClamped, planta_y: yClamped }
                                          : s,
                                  ),
                              },
                    ),
                );

                setGuardadoId(setorAtivo.id);
            }

            setEstadoGravacao('guardado');
            setTimeout(() => setGuardadoId(null), 1200);
        } catch (error) {
            setEstadoGravacao('erro');
            setMensagemErro(
                error.response?.data?.message ??
                    t('mapaEditor.erroGuardar'),
            );
        }
    }

    const posicionados = piso?.setores?.filter((s) => s.planta_x !== null && s.planta_y !== null).length ?? 0;
    const total = piso?.setores?.length ?? 0;
    const progresso = total > 0 ? Math.round((posicionados / total) * 100) : 0;

    const secretariasPosicionadas =
        zonaExpandida?.secretarias?.filter((s) => s.planta_x !== null && s.planta_y !== null).length ?? 0;
    const secretariasTotal = zonaExpandida?.secretarias?.length ?? 0;

    const rotuloSelecao = secretariaAtiva
        ? t('mapaEditor.secretariaCodigo', { codigo: secretariaAtiva.codigo })
        : setorAtivo
            ? `${setorAtivo.numero}. ${setorAtivo.nome}`
            : null;

    return (
        <>
            <Head title={t('mapaEditor.titulo')} />

            <DashboardLayout>
                <section className="dashboard-card overflow-hidden pb-10 sm:pr-2 lg:pr-6">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <MapIcon size={22} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('mapaEditor.titulo')}
                                </h1>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('mapaEditor.subtitulo')}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs font-medium">
                            {estadoGravacao === 'a-guardar' ? (
                                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                                    {t('mapaEditor.aGuardar')}
                                </span>
                            ) : estadoGravacao === 'erro' ? (
                                <span className="inline-flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                    <AlertTriangle size={13} strokeWidth={1.9} />
                                    {t('mapaEditor.erroAoGuardar')}
                                </span>
                            ) : estadoGravacao === 'guardado' ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-600/90 dark:text-emerald-400/90">
                                    <CheckCircle2 size={13} strokeWidth={1.9} />
                                    {t('mapaEditor.alteracoesGuardadas')}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-b border-slate-100 px-6 py-3 dark:border-slate-800 sm:justify-start">
                        {PASSOS.map((texto, indice) => (
                            <div key={texto} className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                                    {indice + 1}
                                </span>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {texto}
                                </span>
                            </div>
                        ))}
                    </div>

                    {estadoGravacao === 'erro' && mensagemErro && (
                        <div className="mx-6 mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                            <AlertTriangle size={19} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">{mensagemErro}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 px-6 pb-6 pt-5 xl:grid-cols-[300px_1fr]">
                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                            <select
                                value={pisoSelecionado || piso?.codigo || ''}
                                onChange={(e) => {
                                    setPisoSelecionado(e.target.value);
                                    setSetorAtivo(null);
                                    setSecretariaAtiva(null);
                                    setZonaExpandidaId(null);
                                }}
                                className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                {dadosPisos?.map((p) => (
                                    <option key={p.id} value={p.codigo}>
                                        {Number(p.numero) === -1
                                            ? t('officeMap.pisoFallback', { numero: p.numero, ns: 'dashboard' })
                                            : formatarNomePiso(p.nome)}
                                    </option>
                                ))}
                            </select>

                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {t('mapaEditor.deTotalPosicionadas', { posicionados, total })}
                            </p>

                            <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-teal-500 transition-all duration-300"
                                    style={{ width: `${progresso}%` }}
                                />
                            </div>

                            <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                                {piso?.setores?.map((setor) => {
                                    const ativo = setorAtivo?.id === setor.id;
                                    const posicionado = setor.planta_x !== null && setor.planta_y !== null;
                                    const expandida = zonaExpandidaId === setor.id;
                                    const numSecretarias = setor.secretarias?.length ?? 0;
                                    const contemSecretariaAtiva = setor.secretarias?.some(
                                        (secretaria) => secretaria.id === secretariaAtiva?.id,
                                    );

                                    return (
                                        <div key={setor.id}>
                                            <button
                                                type="button"
                                                ref={ativo ? itemAtivoRef : undefined}
                                                onClick={() => selecionarSetor(setor)}
                                                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                                                    ativo
                                                        ? 'border-teal-400 bg-teal-500/10 text-teal-700 dark:border-teal-500/50 dark:bg-teal-500/10 dark:text-teal-300'
                                                        : contemSecretariaAtiva
                                                            ? 'border-teal-200 bg-teal-500/5 text-slate-700 dark:border-teal-500/20 dark:bg-teal-500/5 dark:text-slate-200'
                                                            : 'border-transparent bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {numSecretarias > 0 ? (
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(e) => alternarExpandirZona(e, setor)}
                                                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-700"
                                                        >
                                                            {expandida ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </span>
                                                    ) : (
                                                        <span className="w-5 shrink-0" />
                                                    )}

                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                                                        {setor.numero}
                                                    </span>
                                                    <span className="font-semibold">{setor.nome}</span>
                                                </span>

                                                <span className="flex items-center gap-2">
                                                    {numSecretarias > 0 && (
                                                        <span className="text-[10px] font-semibold text-slate-400">
                                                            {rotuloLugares(numSecretarias)}
                                                        </span>
                                                    )}

                                                    {posicionado ? (
                                                        <CheckCircle2 size={15} strokeWidth={2} className="shrink-0 text-emerald-500" />
                                                    ) : (
                                                        <Circle size={13} strokeWidth={2} className="shrink-0 text-slate-300 dark:text-slate-600" />
                                                    )}
                                                </span>
                                            </button>

                                            {expandida && (
                                                <div className="ml-7 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                                                    {setor.secretarias.map((secretaria) => {
                                                        const secretariaAtivaAgora = secretariaAtiva?.id === secretaria.id;
                                                        const secretariaPosicionada =
                                                            secretaria.planta_x !== null && secretaria.planta_y !== null;

                                                        return (
                                                            <button
                                                                key={secretaria.id}
                                                                type="button"
                                                                ref={secretariaAtivaAgora ? itemAtivoRef : undefined}
                                                                onClick={() => selecionarSecretaria(setor, secretaria)}
                                                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-xs transition ${
                                                                    secretariaAtivaAgora
                                                                        ? 'border-teal-400 bg-teal-500/10 text-teal-700 dark:border-teal-500/50 dark:bg-teal-500/10 dark:text-teal-300'
                                                                        : 'border-transparent bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <span className="font-medium">{secretaria.codigo}</span>

                                                                {secretariaPosicionada ? (
                                                                    <CheckCircle2 size={13} strokeWidth={2} className="shrink-0 text-emerald-500" />
                                                                ) : (
                                                                    <Circle size={11} strokeWidth={2} className="shrink-0 text-slate-300 dark:text-slate-600" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {t('mapaEditor.posicionada')}
                            </div>
                        </div>

                        <div className={emEcraCompleto ? 'fixed inset-0 z-[60] flex flex-col bg-white p-6 dark:bg-slate-900' : ''}>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className={`text-sm font-semibold ${rotuloSelecao ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {rotuloSelecao
                                        ? t('mapaEditor.aPosicionar', { rotulo: rotuloSelecao })
                                        : t('mapaEditor.selecionaZonaParaComecar')}
                                </p>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => alterarZoom(-ZOOM_PASSO)}
                                        disabled={zoom <= ZOOM_MIN}
                                        title={t('mapaEditor.diminuirZoom')}
                                        aria-label={t('mapaEditor.diminuirZoom')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                    >
                                        <ZoomOut size={15} strokeWidth={1.9} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => alterarZoom(ZOOM_PASSO)}
                                        disabled={zoom >= ZOOM_MAX}
                                        title={t('mapaEditor.aumentarZoom')}
                                        aria-label={t('mapaEditor.aumentarZoom')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                    >
                                        <ZoomIn size={15} strokeWidth={1.9} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setZoom(1)}
                                        title={t('mapaEditor.reporVisualizacao')}
                                        aria-label={t('mapaEditor.reporVisualizacao')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                                    >
                                        <RotateCcw size={15} strokeWidth={1.9} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEmEcraCompleto((atual) => !atual)}
                                        title={emEcraCompleto ? t('mapaEditor.sairDeEcraInteiro') : t('mapaEditor.ecraInteiro')}
                                        aria-label={emEcraCompleto ? t('mapaEditor.sairDeEcraInteiro') : t('mapaEditor.ecraInteiro')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                                    >
                                        {emEcraCompleto ? <Minimize2 size={15} strokeWidth={1.9} /> : <Maximize2 size={15} strokeWidth={1.9} />}
                                    </button>
                                </div>
                            </div>

                            {zonaExpandida && (
                                <p className="mb-3 -mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {t('mapaEditor.secretariasPosicionadasEmZona', {
                                        posicionadas: secretariasPosicionadas,
                                        total: secretariasTotal,
                                        zona: zonaExpandida.nome,
                                    })}
                                </p>
                            )}

                            <div
                                className="relative overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800"
                                style={{ maxHeight: emEcraCompleto ? 'calc(100vh - 180px)' : 560 }}
                            >
                                <div
                                    onClick={colocarNaPlanta}
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                                    className={`relative w-fit ${
                                        setorAtivo || secretariaAtiva ? 'cursor-crosshair' : 'cursor-default'
                                    }`}
                                >
                                    {piso?.planta ? (
                                        <img
                                            src={piso.planta}
                                            alt={piso.nome}
                                            className="mx-auto max-h-[560px] w-auto max-w-full select-none object-contain"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="flex h-[560px] w-[680px] max-w-full items-center justify-center bg-slate-50 text-sm text-slate-400 dark:bg-slate-800">
                                            {t('mapaEditor.pisoSemPlanta')}
                                        </div>
                                    )}

                                    {piso?.setores
                                        ?.filter((s) => s.planta_x !== null && s.planta_y !== null)
                                        .map((setor) => (
                                            <div
                                                key={setor.id}
                                                className={`pointer-events-none absolute flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-sm ring-1 transition ${
                                                    setorAtivo?.id === setor.id
                                                        ? 'scale-110 bg-teal-500 ring-teal-200'
                                                        : guardadoId === setor.id
                                                          ? 'bg-emerald-500 ring-emerald-200'
                                                          : 'bg-navy-900 ring-white'
                                                }`}
                                                style={{
                                                    left: `${setor.planta_x}%`,
                                                    top: `${setor.planta_y}%`,
                                                }}
                                            >
                                                {setor.numero}
                                            </div>
                                        ))}

                                    {zonaExpandida?.secretarias
                                        ?.filter((s) => s.planta_x !== null && s.planta_y !== null)
                                        .map((secretaria) => (
                                            <div
                                                key={`secretaria-${secretaria.id}`}
                                                className={`pointer-events-none absolute flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-sm ring-1 transition ${
                                                    secretariaAtiva?.id === secretaria.id
                                                        ? 'scale-110 bg-teal-500 ring-teal-200'
                                                        : guardadoId === `secretaria-${secretaria.id}`
                                                          ? 'bg-emerald-500 ring-emerald-200'
                                                          : 'bg-amber-500 ring-white'
                                                }`}
                                                style={{
                                                    left: `${secretaria.planta_x}%`,
                                                    top: `${secretaria.planta_y}%`,
                                                }}
                                            >
                                                {secretaria.numero}
                                            </div>
                                        ))}
                                </div>

                                {mostrarToast && (
                                    <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-lg dark:border-emerald-900/50 dark:bg-slate-900 dark:text-emerald-400">
                                        <CheckCircle2 size={15} strokeWidth={2} />
                                        {t('mapaEditor.posicaoGuardada')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </DashboardLayout>
        </>
    );
}
