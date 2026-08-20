import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CalendarDays, CalendarPlus, Inbox, RotateCcw, Star } from 'lucide-react';
import LugarCard from '@/Components/Reservas/LugarCard';
import LugarCardSkeleton from '@/Components/Reservas/LugarCardSkeleton';
import PreferenciasPanel from '@/Components/Reservas/PreferenciasPanel';
import {
    PREFERENCIAS,
    DURACOES,
    formatarDataPortugues,
    calcularDataFim,
    proximaDataValida,
} from '@/Components/Reservas/reservaHelpers';
import { etiquetaPeriodo } from '@/utils/estados';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const readOnlyFieldClass =
    'h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const PREFERENCIAS_PADRAO = {
    monitor: false,
    dock_usb: false,
    hdmi: false,
    ergonomica: false,
    junto_janela: false,
    luz_natural: false,
    zona_silenciosa: false,
    proximo_copa: false,
};

const QUANTIDADE_POR_PAGINA = 12;

export default function Create({
    periodos,
    pisos,
    setores,
    filters,
}) {
    const { t, i18n } = useTranslation('reservas');
    const { errors } = usePage().props;

    const [filtros, setFiltros] = useState({
        data: filters?.data || proximaDataValida(),
        piso_id: filters?.piso_id ?? '',
        setor_id: filters?.setor_id ?? '',
    });

    const [preferencias, setPreferencias] = useState({
        ...PREFERENCIAS_PADRAO,
    });

    const [setoresFiltrados, setSetoresFiltrados] =
        useState(setores);

    const [lugares, setLugares] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erroConsultaLugares, setErroConsultaLugares] = useState(false);
    const [tentativaConsulta, setTentativaConsulta] = useState(0);

    const [periodosEscolhidos, setPeriodosEscolhidos] =
        useState({});

    const [quantidadeVisivel, setQuantidadeVisivel] =
        useState(QUANTIDADE_POR_PAGINA);

    const [aReservar, setAReservar] = useState(null);
    const [mostrarTodos, setMostrarTodos] = useState(false);

    const [tipoDuracao, setTipoDuracao] =
        useState('diaria');

    // Secretária vinda do mapa do Dashboard (clique numa bolinha), para
    // ir direto àquele lugar em vez de mostrar a lista toda do setor.
    const secretariaAlvo = filters?.secretaria_id
        ? Number(filters.secretaria_id)
        : null;

    const periodosReserva = periodos.filter(
        (periodo) => periodo.nome !== 'Dia inteiro',
    );

    const reservaLonga = tipoDuracao !== 'diaria';

    const dataFimCalculada = useMemo(
        () =>
            calcularDataFim(
                filtros.data,
                tipoDuracao,
            ),
        [filtros.data, tipoDuracao],
    );

    const descricaoDuracao =
        DURACOES[tipoDuracao] ?? DURACOES.diaria;

    /*
     * Só mostrar lugares com pelo menos um período disponível para o
     * modo atual (Manhã/Tarde para reservas diárias, Dia inteiro para
     * as longas) — um lugar sem nenhuma opção disponível não aparece.
     */
    const lugaresComDisponibilidade = lugares.filter((secretaria) => {
        if (reservaLonga) {
            return (
                periodosReserva.length > 1 &&
                periodosReserva.every(
                    (periodo) => secretaria.periodos_disponiveis[periodo.id],
                )
            );
        }

        return periodosReserva.some(
            (periodo) => secretaria.periodos_disponiveis[periodo.id],
        );
    });

    const lugaresExibidos = secretariaAlvo && !mostrarTodos
        ? lugaresComDisponibilidade.filter((lugar) => lugar.id === secretariaAlvo)
        : lugaresComDisponibilidade;

    const lugaresPaginados = lugaresExibidos.slice(0, quantidadeVisivel);
    const existemMaisLugares = lugaresExibidos.length > quantidadeVisivel;

    // Muda sempre que um filtro muda — usado para forçar o remonte dos
    // cartões e assim limpar período selecionado/mensagem de validação
    // que ainda pertençam à pesquisa anterior.
    const chaveFiltros = [
        filtros.data,
        filtros.piso_id,
        filtros.setor_id,
        tipoDuracao,
        Object.values(preferencias).join(''),
    ].join('|');

    const setorSelecionado = setoresFiltrados.find(
        (setor) => setor.id == filtros.setor_id,
    );

    // Valores de omissão para a data (a próxima data válida, calculada
    // no momento) e para os restantes filtros — usados para saber se o
    // utilizador já se afastou deles e mostrar a ação "Limpar filtros".
    const filtrosAlterados =
        filtros.data !== proximaDataValida() ||
        filtros.piso_id !== '' ||
        filtros.setor_id !== '' ||
        tipoDuracao !== 'diaria' ||
        Object.values(preferencias).some(Boolean);

    useEffect(() => {
        if (!secretariaAlvo) {
            return;
        }

        const elemento = document.getElementById(
            `lugar-${secretariaAlvo}`,
        );

        elemento?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [lugares, secretariaAlvo]);

    // Período vindo de "Consultar Disponibilidade" (filters.periodo_id),
    // pré-selecionado assim que o lugar-alvo aparece na lista — só uma
    // vez, para não sobrepor uma escolha manual feita depois.
    const periodoPreenchidoRef = useRef(false);

    useEffect(() => {
        if (
            periodoPreenchidoRef.current ||
            !secretariaAlvo ||
            !filters?.periodo_id
        ) {
            return;
        }

        const alvoCarregado = lugares.some(
            (lugar) => lugar.id === secretariaAlvo,
        );

        if (!alvoCarregado) {
            return;
        }

        setPeriodosEscolhidos((atual) => ({
            ...atual,
            [secretariaAlvo]:
                filters.periodo_id === 'dia_inteiro'
                    ? 'dia_inteiro'
                    : Number(filters.periodo_id),
        }));

        periodoPreenchidoRef.current = true;
    }, [lugares, secretariaAlvo, filters?.periodo_id]);

    /*
     * Sempre que a data, a duração ou algum filtro mudam, eliminar
     * seleções de período anteriores (para reservas longas, o período é
     * automaticamente considerado Dia inteiro) e voltar aos primeiros
     * QUANTIDADE_POR_PAGINA resultados.
     */
    useEffect(() => {
        setPeriodosEscolhidos({});
        setQuantidadeVisivel(QUANTIDADE_POR_PAGINA);
    }, [
        filtros.data,
        filtros.piso_id,
        filtros.setor_id,
        preferencias,
        tipoDuracao,
    ]);

    /*
     * Sem piso escolhido ("Todos os pisos"), a categoria mostra os
     * setores de todo o edifício — não fica bloqueada à espera do piso.
     */
    useEffect(() => {
        if (!filtros.piso_id) {
            setSetoresFiltrados(setores);
            return;
        }

        const filtrados = setores.filter(
            (setor) =>
                setor.piso_id == filtros.piso_id,
        );

        setSetoresFiltrados(filtrados);

        setFiltros((atual) => {
            const setorAindaValido = filtrados.some(
                (setor) =>
                    setor.id == atual.setor_id,
            );

            return setorAindaValido
                ? atual
                : {
                    ...atual,
                    setor_id: '',
                };
        });
    }, [filtros.piso_id, setores]);

    /*
     * Carrega os espaços disponíveis assim que há uma data válida — piso,
     * categoria e preferências são apenas filtros opcionais sobre esse
     * conjunto, sem botão de pesquisa: qualquer alteração atualiza a
     * lista automaticamente.
     */
    useEffect(() => {
        if (!filtros.data) {
            setLugares([]);
            setErroConsultaLugares(false);
            setCarregando(false);
            return;
        }

        const controlador = new AbortController();

        setErroConsultaLugares(false);
        setCarregando(true);

        fetch(
            route('reservas.lugaresPorSetor', {
                data: filtros.data,
                ...(filtros.setor_id ? { setor_id: filtros.setor_id } : {}),
                ...(filtros.piso_id ? { piso_id: filtros.piso_id } : {}),
                ...preferencias,
            }),
            {
                headers: {
                    Accept: 'application/json',
                },
                signal: controlador.signal,
            },
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        'Erro ao consultar disponibilidade.',
                    );
                }

                return response.json();
            })
            .then((dados) => {
                setLugares(dados);
                setCarregando(false);
            })
            .catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }

                console.error(error);
                setLugares([]);
                setErroConsultaLugares(true);
                setCarregando(false);
            });

        return () => {
            controlador.abort();
        };
    }, [
        filtros.data,
        filtros.setor_id,
        filtros.piso_id,
        preferencias,
        tentativaConsulta,
    ]);

    const alternarPreferencia = (chave) => {
        setPreferencias((atual) => ({
            ...atual,
            [chave]: !atual[chave],
        }));
    };

    const limparFiltros = () => {
        setFiltros({
            data: proximaDataValida(),
            piso_id: '',
            setor_id: '',
        });
        setTipoDuracao('diaria');
        setPreferencias({ ...PREFERENCIAS_PADRAO });
    };

    const escolherPeriodo = (
        secretariaId,
        escolha,
    ) => {
        setPeriodosEscolhidos((atual) => ({
            ...atual,
            [secretariaId]: escolha,
        }));
    };

    const reservar = (secretaria) => {
        const escolha = reservaLonga
            ? 'dia_inteiro'
            : periodosEscolhidos[secretaria.id];

        if (!escolha || aReservar) {
            return;
        }

        setAReservar(secretaria.id);

        if (escolha === 'dia_inteiro') {
            router.post(
                route(
                    'reservas.storeDiaInteiro',
                ),
                {
                    data: filtros.data,
                    secretaria_id: secretaria.id,
                    tipo_duracao: tipoDuracao,
                },
                {
                    preserveScroll: (page) =>
                        Object.keys(
                            page.props.errors ?? {},
                        ).length === 0,
                    onFinish: () =>
                        setAReservar(null),
                },
            );

            return;
        }

        router.post(
            route('reservas.store'),
            {
                data: filtros.data,
                periodo_id: escolha,
                secretaria_id: secretaria.id,
                tipo_duracao: tipoDuracao,
            },
            {
                preserveScroll: (page) =>
                    Object.keys(
                        page.props.errors ?? {},
                    ).length === 0,
                onFinish: () =>
                    setAReservar(null),
            },
        );
    };

    return (
        <DashboardLayout>
            <Head title={t('criar.tituloPagina')} />

            <section className="dashboard-card overflow-hidden pb-28">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarPlus
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('criar.tituloPagina')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('criar.subtitulo')}
                        </p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                        {Object.keys(errors).length ===
                            1 ? (
                            Object.values(errors)[0]
                        ) : (
                            <ul className="list-disc space-y-1 pl-4">
                                {Object.values(
                                    errors,
                                ).map(
                                    (
                                        mensagem,
                                        indice,
                                    ) => (
                                        <li key={indice}>
                                            {
                                                mensagem
                                            }
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>
                )}

                <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {t('criar.filtrosDePesquisa')}
                        </p>

                        {filtrosAlterados && (
                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="text-xs font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                            >
                                {t('criar.limparFiltros')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label
                                htmlFor="data"
                                className={labelClass}
                            >
                                {reservaLonga
                                    ? t('criar.dataDeInicio')
                                    : t('criar.data')}
                            </label>

                            <input
                                id="data"
                                type="date"
                                value={filtros.data}
                                onChange={(evento) =>
                                    setFiltros(
                                        (atual) => ({
                                            ...atual,
                                            data: evento
                                                .target
                                                .value,
                                        }),
                                    )
                                }
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="tipo_duracao"
                                className={labelClass}
                            >
                                {t('criar.tipoDeDuracao')}
                            </label>

                            <select
                                id="tipo_duracao"
                                value={tipoDuracao}
                                onChange={(evento) =>
                                    setTipoDuracao(
                                        evento.target
                                            .value,
                                    )
                                }
                                className={fieldClass}
                            >
                                <option value="diaria">
                                    {t('duracoes.diaria.nome')}
                                </option>

                                <option value="semanal">
                                    {t('duracoes.semanal.nome')}
                                </option>

                                <option value="mensal">
                                    {t('duracoes.mensal.nome')}
                                </option>

                                <option value="anual">
                                    {t('duracoes.anual.nome')}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="piso_id"
                                className={labelClass}
                            >
                                {t('criar.piso')}
                            </label>

                            <select
                                id="piso_id"
                                value={filtros.piso_id}
                                onChange={(evento) =>
                                    setFiltros(
                                        (atual) => ({
                                            ...atual,
                                            piso_id:
                                                evento
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                className={fieldClass}
                            >
                                <option value="">
                                    {t('criar.todosOsPisos')}
                                </option>

                                {pisos.map((piso) => (
                                    <option
                                        key={piso.id}
                                        value={piso.id}
                                    >
                                        {piso.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="setor_id"
                                className={labelClass}
                            >
                                {t('criar.categoriaDoEspaco')}
                            </label>

                            <select
                                id="setor_id"
                                value={filtros.setor_id}
                                onChange={(evento) =>
                                    setFiltros(
                                        (atual) => ({
                                            ...atual,
                                            setor_id:
                                                evento
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                className={fieldClass}
                            >
                                <option value="">
                                    {t('criar.todasAsCategorias')}
                                </option>

                                {setoresFiltrados.map(
                                    (setor) => (
                                        <option
                                            key={
                                                setor.id
                                            }
                                            value={
                                                setor.id
                                            }
                                        >
                                            {
                                                setor.nome
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>

                    {setorSelecionado && setorSelecionado.avaliacao_total > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                            <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, indice) => (
                                    <Star
                                        key={indice}
                                        size={16}
                                        fill={
                                            indice < Math.round(setorSelecionado.avaliacao_media)
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>

                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {Number(setorSelecionado.avaliacao_media).toFixed(1)}
                            </span>

                            <span className="text-slate-500 dark:text-slate-400">
                                {t('criar.avaliacao', { count: setorSelecionado.avaliacao_total })}
                            </span>
                        </div>
                    )}

                    {reservaLonga &&
                        filtros.data && (
                            <div className="mt-5 overflow-hidden rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-400/20 dark:bg-teal-400/10">
                                <div className="flex items-start gap-3 border-b border-teal-200 px-4 py-3 dark:border-teal-400/20">
                                    <div className="mt-0.5 text-teal-600 dark:text-teal-300">
                                        <CalendarDays
                                            size={20}
                                            strokeWidth={
                                                1.9
                                            }
                                        />
                                    </div>

                                    <div>
                                        <p className="font-bold text-teal-800 dark:text-teal-200">
                                            {t('criar.reservaTipo', { tipo: t(descricaoDuracao.nome).toLowerCase() })}
                                        </p>

                                        <p className="mt-0.5 text-sm text-teal-700 dark:text-teal-300">
                                            {t(descricaoDuracao.descricao)}{' '}
                                            {t('criar.avisoDiasCorridos')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="data_inicio_visual"
                                            className={
                                                labelClass
                                            }
                                        >
                                            {t('criar.de')}
                                        </label>

                                        <input
                                            id="data_inicio_visual"
                                            type="text"
                                            value={formatarDataPortugues(
                                                filtros.data,
                                                i18n.language,
                                            )}
                                            readOnly
                                            className={
                                                readOnlyFieldClass
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="data_fim_visual"
                                            className={
                                                labelClass
                                            }
                                        >
                                            {t('criar.ate')}
                                        </label>

                                        <input
                                            id="data_fim_visual"
                                            type="text"
                                            value={formatarDataPortugues(
                                                dataFimCalculada,
                                                i18n.language,
                                            )}
                                            readOnly
                                            className={
                                                readOnlyFieldClass
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    {reservaLonga &&
                        !filtros.data && (
                            <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                                {t('criar.avisoReservaLongaSemData')}
                            </div>
                        )}

                    <PreferenciasPanel
                        preferenciasDisponiveis={PREFERENCIAS}
                        preferencias={preferencias}
                        onAlternarPreferencia={alternarPreferencia}
                    />
                </div>

                <div className="px-6 py-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('criar.espacosDisponiveis')}
                        </h2>

                        {filtros.data && (
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {carregando
                                    ? t('criar.aProcurarEspacos')
                                    : t('criar.espacoEncontrado', {
                                          count: lugaresComDisponibilidade.length,
                                          data: formatarDataPortugues(filtros.data, i18n.language),
                                      })}
                            </p>
                        )}
                    </div>

                    {!filtros.data ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('criar.escolheUmaData')}
                        </p>
                    ) : erroConsultaLugares ? (
                        <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={18} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                                <span>
                                    {t('criar.erroCarregarEspacos')}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setTentativaConsulta((atual) => atual + 1)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10"
                            >
                                <RotateCcw size={14} strokeWidth={2} />
                                {t('criar.tentarNovamente')}
                            </button>
                        </div>
                    ) : carregando ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: QUANTIDADE_POR_PAGINA }).map((_, indice) => (
                                <LugarCardSkeleton key={indice} />
                            ))}
                        </div>
                    ) : lugaresComDisponibilidade.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-800/40">
                            <Inbox size={28} strokeWidth={1.6} className="text-slate-300 dark:text-slate-600" />

                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('criar.nenhumEspacoEncontrado')}
                            </p>

                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="text-xs font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                            >
                                {t('criar.limparFiltros')}
                            </button>
                        </div>
                    ) : (
                        <div>
                            {secretariaAlvo && !mostrarTodos && (
                                <div className="mb-4 flex items-center justify-between rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-2.5 text-sm text-teal-700 dark:text-teal-400">
                                    <span>{t('criar.aReservarLugarDoMapa')}</span>

                                    <button
                                        type="button"
                                        onClick={() => setMostrarTodos(true)}
                                        className="font-semibold underline underline-offset-2 hover:no-underline"
                                    >
                                        {t('criar.verTodosOsLugares')}
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {lugaresPaginados.map(
                                    (secretaria) => (
                                        <LugarCard
                                            key={`${secretaria.id}-${chaveFiltros}`}
                                            secretaria={secretaria}
                                            periodosReserva={periodosReserva}
                                            reservaLonga={reservaLonga}
                                            periodoEscolhido={
                                                reservaLonga
                                                    ? 'dia_inteiro'
                                                    : periodosEscolhidos[secretaria.id] ?? null
                                            }
                                            onEscolherPeriodo={escolherPeriodo}
                                            ehAlvo={secretaria.id === secretariaAlvo}
                                            aReservar={aReservar}
                                            onReservar={reservar}
                                            dataInicio={filtros.data}
                                            dataFimCalculada={dataFimCalculada}
                                        />
                                    ),
                                )}
                            </div>

                            {existemMaisLugares && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantidadeVisivel(
                                                (atual) => atual + QUANTIDADE_POR_PAGINA,
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-500/50 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        {t('criar.carregarMaisEspacos')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
