import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CalendarDays, CalendarPlus, RotateCcw, Star } from 'lucide-react';
import LugarCard from '@/Components/Reservas/LugarCard';
import PreferenciasPanel from '@/Components/Reservas/PreferenciasPanel';
import {
    PREFERENCIAS,
    DURACOES,
    formatarDataPortugues,
    dataEhFimDeSemana,
    calcularDataFim,
} from '@/Components/Reservas/reservaHelpers';
import { resolverImagemPorSetor } from '@/utils/imagemSetor';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const readOnlyFieldClass =
    'h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Create({
    periodos,
    pisos,
    setores,
    filters,
}) {
    const { errors } = usePage().props;

    const [filtros, setFiltros] = useState({
        data: filters?.data ?? '',
        piso_id: filters?.piso_id ?? '',
        setor_id: filters?.setor_id ?? '',
    });

    const [preferencias, setPreferencias] = useState({
        monitor: false,
        dock_usb: false,
        hdmi: false,
        ergonomica: false,
        junto_janela: false,
        luz_natural: false,
        zona_silenciosa: false,
        proximo_copa: false,
    });

    const [setoresFiltrados, setSetoresFiltrados] =
        useState([]);

    const [lugares, setLugares] = useState([]);
    const [erroConsultaLugares, setErroConsultaLugares] = useState(false);
    const [tentativaConsulta, setTentativaConsulta] = useState(0);

    const [periodosEscolhidos, setPeriodosEscolhidos] =
        useState({});

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

    const inicioEmFimDeSemana =
        reservaLonga &&
        filtros.data &&
        dataEhFimDeSemana(filtros.data);

    const descricaoDuracao =
        DURACOES[tipoDuracao] ?? DURACOES.diaria;

    const lugaresExibidos = secretariaAlvo && !mostrarTodos
        ? lugares.filter((lugar) => lugar.id === secretariaAlvo)
        : lugares;

    const setorSelecionado = setoresFiltrados.find(
        (setor) => setor.id == filtros.setor_id,
    );

    const imagemPorTipo = resolverImagemPorSetor(setorSelecionado);

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

    /*
     * Quando a duração muda, eliminar seleções anteriores.
     *
     * Para reservas longas, o período é automaticamente
     * considerado Dia inteiro.
     */
    useEffect(() => {
        setPeriodosEscolhidos({});
    }, [tipoDuracao]);

    useEffect(() => {
        if (!filtros.piso_id) {
            setSetoresFiltrados([]);
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

    useEffect(() => {
        if (
            !filtros.data ||
            !filtros.setor_id ||
            inicioEmFimDeSemana
        ) {
            setLugares([]);
            setErroConsultaLugares(false);
            return;
        }

        const controlador = new AbortController();

        setErroConsultaLugares(false);

        fetch(
            route('reservas.lugaresPorSetor', {
                data: filtros.data,
                setor_id: filtros.setor_id,
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
            })
            .catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }

                console.error(error);
                setLugares([]);
                setErroConsultaLugares(true);
            });

        return () => {
            controlador.abort();
        };
    }, [
        filtros.data,
        filtros.setor_id,
        preferencias,
        inicioEmFimDeSemana,
        tentativaConsulta,
    ]);

    const alternarPreferencia = (chave) => {
        setPreferencias((atual) => ({
            ...atual,
            [chave]: !atual[chave],
        }));
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

        if (
            !escolha ||
            aReservar ||
            inicioEmFimDeSemana
        ) {
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
            <Head title="Nova Reserva" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarPlus
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Nova Reserva
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Escolhe a data, a duração e o
                            tipo de espaço. Depois seleciona
                            o período e reserva.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
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

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label
                                htmlFor="data"
                                className={labelClass}
                            >
                                {reservaLonga
                                    ? 'Data de início'
                                    : 'Data'}
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
                                Tipo de duração
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
                                    Diária
                                </option>

                                <option value="semanal">
                                    Semanal
                                </option>

                                <option value="mensal">
                                    Mensal
                                </option>

                                <option value="anual">
                                    Anual
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="piso_id"
                                className={labelClass}
                            >
                                Piso
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
                                    Selecione...
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
                                Categoria do Espaço
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
                                disabled={!filtros.piso_id}
                                className={fieldClass}
                            >
                                <option value="">
                                    {filtros.piso_id
                                        ? 'Selecione...'
                                        : 'Selecione primeiro o piso'}
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
                                ({setorSelecionado.avaliacao_total} avaliaç{setorSelecionado.avaliacao_total === 1 ? 'ão' : 'ões'})
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
                                            Reserva{' '}
                                            {descricaoDuracao.nome.toLowerCase()}
                                        </p>

                                        <p className="mt-0.5 text-sm text-teal-700 dark:text-teal-300">
                                            {
                                                descricaoDuracao.diasUteis
                                            }{' '}
                                            dias úteis,
                                            sempre no
                                            período Dia
                                            inteiro.
                                        </p>
                                    </div>
                                </div>

                                {inicioEmFimDeSemana ? (
                                    <div className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
                                        As reservas
                                        semanais, mensais
                                        e anuais devem
                                        começar num dia
                                        útil. Escolhe uma
                                        data de segunda a
                                        sexta-feira.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="data_inicio_visual"
                                                className={
                                                    labelClass
                                                }
                                            >
                                                De
                                            </label>

                                            <input
                                                id="data_inicio_visual"
                                                type="text"
                                                value={formatarDataPortugues(
                                                    filtros.data,
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
                                                Até
                                            </label>

                                            <input
                                                id="data_fim_visual"
                                                type="text"
                                                value={formatarDataPortugues(
                                                    dataFimCalculada,
                                                )}
                                                readOnly
                                                className={
                                                    readOnlyFieldClass
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {reservaLonga &&
                        !filtros.data && (
                            <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                                As reservas semanais,
                                mensais e anuais são
                                efetuadas apenas para o
                                dia inteiro. Escolhe a
                                data de início para veres
                                a data final.
                            </div>
                        )}

                    <PreferenciasPanel
                        preferenciasDisponiveis={PREFERENCIAS}
                        preferencias={preferencias}
                        onAlternarPreferencia={alternarPreferencia}
                    />

                    <div className="mt-8">
                        {!filtros.data ||
                            !filtros.setor_id ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Escolhe a data, o piso e
                                a categoria do espaço
                                para veres os lugares
                                disponíveis.
                            </p>
                        ) : inicioEmFimDeSemana ? (
                            <p className="text-sm font-medium text-red-600 dark:text-red-300">
                                Escolhe um dia útil para
                                consultares os lugares
                                disponíveis para esta
                                duração.
                            </p>
                        ) : erroConsultaLugares ? (
                            <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={18} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                                    <span>
                                        Não foi possível consultar a disponibilidade dos lugares. Verifica a tua ligação e tenta novamente.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setTentativaConsulta((atual) => atual + 1)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10"
                                >
                                    <RotateCcw size={14} strokeWidth={2} />
                                    Tentar novamente
                                </button>
                            </div>
                        ) : lugares.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Não existem lugares
                                disponíveis para a data e
                                categoria selecionadas.
                            </p>
                        ) : (
                            <div>
                                {secretariaAlvo && !mostrarTodos && (
                                    <div className="mb-4 flex items-center justify-between rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-2.5 text-sm text-teal-700 dark:text-teal-400">
                                        <span>A reservar diretamente o lugar selecionado no mapa.</span>

                                        <button
                                            type="button"
                                            onClick={() => setMostrarTodos(true)}
                                            className="font-semibold underline underline-offset-2 hover:no-underline"
                                        >
                                            Ver todos os lugares deste setor
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {lugaresExibidos.map(
                                        (secretaria) => (
                                            <LugarCard
                                                key={secretaria.id}
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
                                                imagemPorTipo={imagemPorTipo}
                                                aReservar={aReservar}
                                                onReservar={reservar}
                                                dataInicio={filtros.data}
                                                dataFimCalculada={dataFimCalculada}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <Link
                            href={route(
                                'reservas.index',
                            )}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft
                                size={16}
                                strokeWidth={1.9}
                            />

                            Cancelar
                        </Link>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}
