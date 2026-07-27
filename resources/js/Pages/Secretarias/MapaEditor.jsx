import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';

export default function MapaEditor({ pisos }) {
    const [dadosPisos, setDadosPisos] = useState(pisos);
    const [pisoSelecionado, setPisoSelecionado] = useState(pisos?.[0]?.codigo ?? '');
    const [setorAtivo, setSetorAtivo] = useState(null);
    const [zonaExpandidaId, setZonaExpandidaId] = useState(null);
    const [secretariaAtiva, setSecretariaAtiva] = useState(null);
    const [aGuardar, setAGuardar] = useState(false);
    const [guardadoId, setGuardadoId] = useState(null);

    const piso = useMemo(
        () => dadosPisos?.find((p) => p.codigo === pisoSelecionado) ?? dadosPisos?.[0],
        [dadosPisos, pisoSelecionado],
    );

    const zonaExpandida = useMemo(
        () => piso?.setores?.find((s) => s.id === zonaExpandidaId) ?? null,
        [piso, zonaExpandidaId],
    );

    function selecionarSetor(setor) {
        setSetorAtivo(setor);
        setSecretariaAtiva(null);
    }

    function alternarExpandirZona(event, setor) {
        event.stopPropagation();
        setZonaExpandidaId((atual) => (atual === setor.id ? null : setor.id));
    }

    function selecionarSecretaria(secretaria) {
        setSecretariaAtiva(secretaria);
        setSetorAtivo(null);
    }

    async function colocarNaPlanta(event) {
        if (!piso || (!setorAtivo && !secretariaAtiva)) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
        const xClamped = Math.min(Math.max(x, 0), 100);
        const yClamped = Math.min(Math.max(y, 0), 100);

        setAGuardar(true);

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

            setTimeout(() => setGuardadoId(null), 1200);
        } finally {
            setAGuardar(false);
        }
    }

    const posicionados = piso?.setores?.filter((s) => s.planta_x !== null && s.planta_y !== null).length ?? 0;
    const total = piso?.setores?.length ?? 0;

    const secretariasPosicionadas =
        zonaExpandida?.secretarias?.filter((s) => s.planta_x !== null && s.planta_y !== null).length ?? 0;
    const secretariasTotal = zonaExpandida?.secretarias?.length ?? 0;

    return (
        <>
            <Head title="Editor do Mapa" />

            <DashboardLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Editor do Mapa
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Seleciona uma zona/sala na lista e clica na planta para a posicionar — igual às legendas numeradas das plantas oficiais. A posição é guardada automaticamente.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
                    <div className="dashboard-card p-5">
                        <select
                            value={pisoSelecionado || piso?.codigo || ''}
                            onChange={(e) => {
                                setPisoSelecionado(e.target.value);
                                setSetorAtivo(null);
                                setSecretariaAtiva(null);
                                setZonaExpandidaId(null);
                            }}
                            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            {dadosPisos?.map((p) => (
                                <option key={p.id} value={p.codigo}>
                                    {p.nome}
                                </option>
                            ))}
                        </select>

                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {posicionados} / {total} posicionadas
                        </p>

                        <div className="max-h-[600px] space-y-1.5 overflow-y-auto pr-1">
                            {piso?.setores?.map((setor) => {
                                const ativo = setorAtivo?.id === setor.id;
                                const posicionado = setor.planta_x !== null && setor.planta_y !== null;
                                const expandida = zonaExpandidaId === setor.id;
                                const numSecretarias = setor.secretarias?.length ?? 0;

                                return (
                                    <div key={setor.id}>
                                        <button
                                            type="button"
                                            onClick={() => selecionarSetor(setor)}
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                                ativo
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-surface text-slate-700 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {numSecretarias > 0 ? (
                                                    <span
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) => alternarExpandirZona(e, setor)}
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                                                            ativo ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {expandida ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </span>
                                                ) : (
                                                    <span className="w-5 shrink-0" />
                                                )}

                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                                        ativo ? 'bg-white/25 text-white' : 'bg-navy-900 text-white'
                                                    }`}
                                                >
                                                    {setor.numero}
                                                </span>
                                                <span className="font-semibold">{setor.nome}</span>
                                            </span>

                                            <span className="flex items-center gap-2">
                                                {numSecretarias > 0 && (
                                                    <span
                                                        className={`text-[10px] font-semibold ${
                                                            ativo ? 'text-white/80' : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {numSecretarias} lugares
                                                    </span>
                                                )}

                                                <span
                                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                                        posicionado ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                                />
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
                                                            onClick={() => selecionarSecretaria(secretaria)}
                                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition ${
                                                                secretariaAtivaAgora
                                                                    ? 'bg-teal-500 text-white'
                                                                    : 'bg-surface text-slate-600 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                                                            }`}
                                                        >
                                                            <span className="font-medium">{secretaria.codigo}</span>

                                                            <span
                                                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                                                    secretariaPosicionada
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-slate-300 dark:bg-slate-600'
                                                                }`}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="dashboard-card p-6">
                        {secretariaAtiva ? (
                            <p className="mb-4 text-sm font-semibold text-teal-600 dark:text-teal-400">
                                A posicionar a secretária <span className="underline">{secretariaAtiva.codigo}</span> ({zonaExpandida?.nome}) — clica na planta para a colocar.
                                {aGuardar && ' A guardar…'}
                            </p>
                        ) : setorAtivo ? (
                            <p className="mb-4 text-sm font-semibold text-teal-600 dark:text-teal-400">
                                A posicionar <span className="underline">{setorAtivo.numero}. {setorAtivo.nome}</span> — clica na planta para a colocar.
                                {aGuardar && ' A guardar…'}
                            </p>
                        ) : (
                            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                Seleciona uma zona na lista à esquerda para começar. Abre a seta ao lado de uma zona para posicionar as secretárias uma a uma.
                            </p>
                        )}

                        {zonaExpandida && (
                            <p className="mb-4 -mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {secretariasPosicionadas} / {secretariasTotal} secretárias posicionadas em {zonaExpandida.nome}
                            </p>
                        )}

                        <div
                            onClick={colocarNaPlanta}
                            className={`relative mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 ${
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
                                    Este piso ainda não tem planta associada.
                                </div>
                            )}

                            {piso?.setores
                                ?.filter((s) => s.planta_x !== null && s.planta_y !== null)
                                .map((setor) => (
                                    <div
                                        key={setor.id}
                                        className={`pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-lg ring-2 transition ${
                                            setorAtivo?.id === setor.id
                                                ? 'scale-125 bg-teal-500 ring-teal-200'
                                                : guardadoId === setor.id
                                                  ? 'bg-emerald-500 ring-emerald-200'
                                                  : 'bg-navy-900 ring-slate-200'
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
                                        className={`pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white shadow ring-2 transition ${
                                            secretariaAtiva?.id === secretaria.id
                                                ? 'scale-125 bg-teal-500 ring-teal-200'
                                                : guardadoId === `secretaria-${secretaria.id}`
                                                  ? 'bg-emerald-500 ring-emerald-200'
                                                  : 'bg-amber-500 ring-amber-100'
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
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
