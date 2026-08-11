import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ImageOff, Info, Pencil, RotateCcw } from 'lucide-react';
import PreferenciasPanel from '@/Components/Reservas/PreferenciasPanel';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { PREFERENCIAS } from '@/Components/Reservas/reservaHelpers';
import { resolverImagemPorSetor } from '@/utils/imagemSetor';
import { RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT } from '@/Lib/reservaAlteracaoBar';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const PREFERENCIAS_PADRAO = {
    monitor: false,
    dock_usb: false,
    hdmi: false,
    junto_janela: false,
    ergonomica: false,
    luz_natural: false,
    zona_silenciosa: false,
    proximo_copa: false,
};

const AVISO_ALTERACOES_POR_GUARDAR =
    'Tens alterações por guardar. Se saíres agora, elas são perdidas. Queres mesmo sair?';

/**
 * Nome do espaço a partir da secretária — a mesma categoria + número que
 * já é usada como título dos cartões (ex.: "Phone Booth 03"), reutilizada
 * na barra de alteração para o nome do espaço ser a informação principal
 * (nunca escrito diretamente no componente).
 */
function nomeEspaco(secretaria) {
    if (!secretaria) {
        return '-';
    }

    const categoriaNome = secretaria.setor?.nome;
    const numeroLugar = secretaria.codigo?.match(/\d+$/)?.[0];

    return categoriaNome
        ? `${categoriaNome} ${numeroLugar ?? ''}`.trim()
        : secretaria.codigo;
}

export default function Edit({ reserva, periodos, pisos, setores, parDiaInteiro }) {
    const { errors } = usePage().props;

    const [filtros, setFiltros] = useState({
        data: reserva.data,
        piso_id: String(reserva.secretaria.setor.piso_id),
        setor_id: String(reserva.secretaria.setor_id),
    });
    const [preferencias, setPreferencias] = useState({ ...PREFERENCIAS_PADRAO });
    const [setoresFiltrados, setSetoresFiltrados] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [selecao, setSelecao] = useState({
        secretariaId: reserva.secretaria_id,
        periodoId: reserva.periodo_id,
    });
    const [aGuardar, setAGuardar] = useState(false);

    // Filtra os tipos de espaço conforme o piso selecionado. Mantém o
    // setor atual se continuar válido para o piso.
    useEffect(() => {
        if (!filtros.piso_id) {
            setSetoresFiltrados([]);
            return;
        }

        const filtrados = setores.filter((setor) => setor.piso_id == filtros.piso_id);
        setSetoresFiltrados(filtrados);

        setFiltros((atual) => {
            const setorAindaValido = filtrados.some((setor) => setor.id == atual.setor_id);
            return setorAindaValido ? atual : { ...atual, setor_id: '' };
        });
    }, [filtros.piso_id, setores]);

    const setorSelecionado = setoresFiltrados.find(
        (setor) => setor.id == filtros.setor_id,
    );

    const imagemPorTipo = resolverImagemPorSetor(setorSelecionado);

    // "Dia inteiro" não é mais um período disponível igual a
    // Manhã/Tarde — é calculado como "os dois estão livres ao mesmo
    // tempo", igual ao que Create.jsx/LugarCard.jsx já fazem. Sem isto,
    // uma reserva originalmente feita como Dia inteiro ficava sem
    // forma de voltar a ser Dia inteiro ao editar.
    const periodosMeioDia = periodos.filter(
        (periodo) => periodo.nome !== 'Dia inteiro',
    );
    const periodoDiaInteiro = periodos.find(
        (periodo) => periodo.nome === 'Dia inteiro',
    );

    // Consulta os lugares do setor escolhido, excluindo esta própria
    // reserva do cálculo de disponibilidade (para não aparecer bloqueada
    // a si mesma).
    useEffect(() => {
        if (!filtros.data || !filtros.setor_id) {
            setLugares([]);
            return;
        }

        const controlador = new AbortController();

        fetch(route('reservas.lugaresPorSetor', {
            data: filtros.data,
            setor_id: filtros.setor_id,
            excluir_reserva_id: reserva.id,
            ...preferencias,
        }), {
            headers: {
                Accept: 'application/json',
            },
            signal: controlador.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }
                return response.json();
            })
            .then((dados) => setLugares(dados))
            .catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error(error);
                setLugares([]);
            });

        return () => controlador.abort();
    }, [filtros.data, filtros.setor_id, preferencias]);

    // Sempre que a data ou algum filtro mudam, a seleção provisória e o
    // resumo de alteração (que dependem dela) deixam de fazer sentido —
    // volta ao estado "sem alteração" (igual à reserva original).
    useEffect(() => {
        setSelecao({
            secretariaId: reserva.secretaria_id,
            periodoId: reserva.periodo_id,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.data, filtros.piso_id, filtros.setor_id, preferencias]);

    const escolher = (secretariaId, periodoId) => {
        setSelecao({ secretariaId, periodoId });
    };

    // Valores de omissão para os filtros — os da própria reserva, não os
    // de uma pesquisa em branco — usados tanto por "Limpar filtros" como
    // por "Descartar alterações".
    const filtrosPadrao = {
        data: reserva.data,
        piso_id: String(reserva.secretaria.setor.piso_id),
        setor_id: String(reserva.secretaria.setor_id),
    };

    const filtrosAlterados =
        filtros.data !== filtrosPadrao.data ||
        filtros.piso_id !== filtrosPadrao.piso_id ||
        filtros.setor_id !== filtrosPadrao.setor_id ||
        Object.values(preferencias).some(Boolean);

    const limparFiltros = () => {
        setFiltros({ ...filtrosPadrao });
        setPreferencias({ ...PREFERENCIAS_PADRAO });
    };

    const descartarAlteracoes = () => {
        setFiltros({ ...filtrosPadrao });
        setSelecao({
            secretariaId: reserva.secretaria_id,
            periodoId: reserva.periodo_id,
        });
    };

    const houveAlteracao =
        selecao.secretariaId !== reserva.secretaria_id ||
        selecao.periodoId !== reserva.periodo_id;

    const nomePeriodo = (periodoId) =>
        periodos.find((periodo) => periodo.id === periodoId)?.nome ?? '-';

    // O espaço do lado "Nova seleção" tanto pode ser a própria reserva
    // (quando só o período muda) como um dos lugares carregados.
    const secretariaNova =
        selecao.secretariaId === reserva.secretaria_id
            ? reserva.secretaria
            : lugares.find((lugar) => lugar.id === selecao.secretariaId);

    const codigoAtual = reserva.secretaria.codigo;
    const tituloAtual = nomeEspaco(reserva.secretaria);
    const codigoNovo = secretariaNova?.codigo ?? '-';
    const tituloNovo = nomeEspaco(secretariaNova);

    // Avisa o ChatWidget (via evento global, mesmo padrão do banner de
    // cookies) para subir e não sobrepor a barra fixa enquanto ela está
    // visível.
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                detail: { visible: houveAlteracao },
            }),
        );

        return () => {
            window.dispatchEvent(
                new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                    detail: { visible: false },
                }),
            );
        };
    }, [houveAlteracao]);

    // Impede sair da página (navegação Inertia ou fecho/refresh do
    // separador) com uma alteração por guardar, sem bloquear o próprio
    // pedido de guardar.
    const houveAlteracaoRef = useRef(houveAlteracao);
    const aSubmeterRef = useRef(false);

    useEffect(() => {
        houveAlteracaoRef.current = houveAlteracao;
    }, [houveAlteracao]);

    useEffect(() => {
        const removerListener = router.on('before', (event) => {
            if (aSubmeterRef.current) {
                return;
            }

            if (houveAlteracaoRef.current && !window.confirm(AVISO_ALTERACOES_POR_GUARDAR)) {
                event.preventDefault();
            }
        });

        return removerListener;
    }, []);

    useEffect(() => {
        const aoTentarFechar = (event) => {
            if (!houveAlteracaoRef.current) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', aoTentarFechar);
        return () => window.removeEventListener('beforeunload', aoTentarFechar);
    }, []);

    const submit = (e) => {
        e.preventDefault();

        if (!selecao.secretariaId || !selecao.periodoId || aGuardar) {
            return;
        }

        aSubmeterRef.current = true;
        setAGuardar(true);

        router.put(route('reservas.update', reserva.id), {
            data: filtros.data,
            periodo_id: selecao.periodoId,
            secretaria_id: selecao.secretariaId,
            observacoes: reserva.observacoes ?? '',
        }, {
            onFinish: () => {
                setAGuardar(false);
                aSubmeterRef.current = false;
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Editar Reserva" />

            <div className={houveAlteracao ? 'pb-72 lg:pb-28' : 'pb-28'}>
                <section className="dashboard-card overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Pencil size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Editar Reserva
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Escolhe a data e o tipo de espaço, depois seleciona o novo período/lugar.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-6" noValidate>
                        {parDiaInteiro && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                                <Info size={18} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                                <span>
                                    Esta reserva faz parte de uma reserva de dia inteiro — também tens o
                                    período <strong>{parDiaInteiro}</strong> reservado nesta secretária. Alterar
                                    aqui só afeta este período.
                                </span>
                            </div>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                                {Object.keys(errors).length === 1 ? (
                                    Object.values(errors)[0]
                                ) : (
                                    <ul className="list-disc space-y-1 pl-4">
                                        {Object.values(errors).map((mensagem, indice) => (
                                            <li key={indice}>{mensagem}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {filtrosAlterados && (
                            <div className="mb-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={limparFiltros}
                                    className="text-xs font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div>
                                <label htmlFor="data" className={labelClass}>Data</label>
                                <input
                                    id="data"
                                    type="date"
                                    value={filtros.data}
                                    onChange={(e) => setFiltros((atual) => ({ ...atual, data: e.target.value }))}
                                    required
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="piso_id" className={labelClass}>Piso</label>
                                <select
                                    id="piso_id"
                                    value={filtros.piso_id}
                                    onChange={(e) => setFiltros((atual) => ({ ...atual, piso_id: e.target.value }))}
                                    required
                                    className={fieldClass}
                                >
                                    <option value="" disabled>Selecione...</option>

                                    {pisos.map((piso) => (
                                        <option key={piso.id} value={piso.id}>
                                            {piso.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="setor_id" className={labelClass}>Categoria do Espaço</label>
                                <select
                                    id="setor_id"
                                    value={filtros.setor_id}
                                    onChange={(e) => setFiltros((atual) => ({ ...atual, setor_id: e.target.value }))}
                                    disabled={!filtros.piso_id}
                                    required
                                    className={fieldClass}
                                >
                                    <option value="" disabled>
                                        {filtros.piso_id ? 'Selecione...' : 'Selecione primeiro o piso'}
                                    </option>

                                    {setoresFiltrados.map((setor) => (
                                        <option key={setor.id} value={setor.id}>
                                            {setor.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <PreferenciasPanel
                            preferenciasDisponiveis={PREFERENCIAS}
                            preferencias={preferencias}
                            onAlternarPreferencia={(chave) =>
                                setPreferencias((atual) => ({
                                    ...atual,
                                    [chave]: !atual[chave],
                                }))
                            }
                        />

                        <div className="mt-8">
                            {lugares.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Não existem lugares disponíveis para a data e categoria selecionadas.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {lugares.map((secretaria) => {
                                        const ehCardAtual = secretaria.id === reserva.secretaria_id;
                                        const ehCardNovaSelecao =
                                            houveAlteracao && selecao.secretariaId === secretaria.id;

                                        const titulo = nomeEspaco(secretaria);

                                        return (
                                            <div
                                                key={secretaria.id}
                                                className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${
                                                    ehCardNovaSelecao
                                                        ? 'border-teal-500 ring-4 ring-teal-500/15'
                                                        : ehCardAtual
                                                            ? 'border-blue-300 ring-2 ring-blue-100 dark:border-blue-500/40 dark:ring-blue-500/10'
                                                            : 'border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                <div className="relative">
                                                    {secretaria.imagem_url || imagemPorTipo ? (
                                                        <img
                                                            src={secretaria.imagem_url || imagemPorTipo}
                                                            alt={titulo}
                                                            className="h-40 w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                            <ImageOff size={28} strokeWidth={1.6} />
                                                        </div>
                                                    )}

                                                    <span className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                                                        {secretaria.codigo}
                                                    </span>

                                                    {ehCardNovaSelecao ? (
                                                        <span className="absolute right-2.5 top-2.5 rounded-full bg-teal-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                                            Nova seleção
                                                        </span>
                                                    ) : ehCardAtual ? (
                                                        <span className="absolute right-2.5 top-2.5 rounded-full bg-navy-900/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                                            Atual
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-1 flex-col p-4">
                                                    <p className="truncate text-base font-bold leading-tight text-slate-900 dark:text-white">
                                                        {titulo}
                                                    </p>

                                                    <LocalizacaoEspaco secretaria={secretaria} className="mt-1" />

                                                    <div className="mt-4 flex gap-2">
                                                        {periodosMeioDia.map((periodo) => {
                                                            const ehSlotOriginal = ehCardAtual
                                                                && filtros.data === reserva.data
                                                                && periodo.id === reserva.periodo_id;
                                                            const disponivel = ehSlotOriginal || secretaria.periodos_disponiveis[periodo.id];
                                                            const ehNovaSelecaoPeriodo =
                                                                houveAlteracao
                                                                && selecao.secretariaId === secretaria.id
                                                                && selecao.periodoId === periodo.id;

                                                            return (
                                                                <button
                                                                    key={periodo.id}
                                                                    type="button"
                                                                    disabled={!disponivel}
                                                                    aria-pressed={ehNovaSelecaoPeriodo}
                                                                    onClick={() => escolher(secretaria.id, periodo.id)}
                                                                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                        ehNovaSelecaoPeriodo
                                                                            ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                                                                            : ehSlotOriginal
                                                                                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300'
                                                                                : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                                    }`}
                                                                >
                                                                    {periodo.nome}
                                                                </button>
                                                            );
                                                        })}

                                                        {periodoDiaInteiro && (() => {
                                                            const ehSlotOriginalDiaInteiro = ehCardAtual
                                                                && filtros.data === reserva.data
                                                                && periodoDiaInteiro.id === reserva.periodo_id;
                                                            const ambosOsMeiosDiasDisponiveis = periodosMeioDia.every(
                                                                (periodo) => secretaria.periodos_disponiveis[periodo.id],
                                                            );
                                                            const disponivel = ehSlotOriginalDiaInteiro || ambosOsMeiosDiasDisponiveis;
                                                            const ehNovaSelecaoPeriodo =
                                                                houveAlteracao
                                                                && selecao.secretariaId === secretaria.id
                                                                && selecao.periodoId === periodoDiaInteiro.id;

                                                            return (
                                                                <button
                                                                    key={periodoDiaInteiro.id}
                                                                    type="button"
                                                                    disabled={!disponivel}
                                                                    aria-pressed={ehNovaSelecaoPeriodo}
                                                                    onClick={() => escolher(secretaria.id, periodoDiaInteiro.id)}
                                                                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                        ehNovaSelecaoPeriodo
                                                                            ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                                                                            : ehSlotOriginalDiaInteiro
                                                                                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300'
                                                                                : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                                    }`}
                                                                >
                                                                    {periodoDiaInteiro.nome}
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {houveAlteracao && (
                            <div className="fixed inset-x-0 bottom-0 z-40 lg:left-[272px]">
                                <div className="mx-auto max-w-[1660px] px-5 pb-5 sm:px-7 lg:px-9">
                                    <div className="flex flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50/95 px-5 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur dark:border-teal-400/20 dark:bg-slate-900/95 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                                                    Atual
                                                </p>

                                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                    {tituloAtual}
                                                </p>

                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {codigoAtual} · {nomePeriodo(reserva.periodo_id)}
                                                </p>
                                            </div>

                                            <span className="hidden shrink-0 text-lg font-bold text-teal-500 sm:block">
                                                →
                                            </span>

                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-teal-600 dark:text-teal-300">
                                                    Nova seleção
                                                </p>

                                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                    {tituloNovo}
                                                </p>

                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {codigoNovo} · {nomePeriodo(selecao.periodoId)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                disabled={aGuardar}
                                                onClick={descartarAlteracoes}
                                                className="rounded-xl border border-teal-300 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-400/30 dark:text-teal-300 dark:hover:bg-teal-400/10"
                                            >
                                                Descartar alterações
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={aGuardar}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                            >
                                                {aGuardar && (
                                                    <RotateCcw size={16} strokeWidth={2} className="animate-spin" />
                                                )}
                                                {aGuardar ? 'A guardar...' : 'Guardar alterações'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </section>
            </div>
        </DashboardLayout>
    );
}
