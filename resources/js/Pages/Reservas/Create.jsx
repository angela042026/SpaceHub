import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CalendarPlus,
    ImageOff,
} from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const readOnlyFieldClass =
    'h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const PREFERENCIAS = [
    { key: 'monitor', label: 'Monitor' },
    { key: 'dock_usb', label: 'Dock USB' },
    { key: 'junto_janela', label: 'Junto à janela' },
    { key: 'ergonomica', label: 'Cadeira ergonómica' },
];

const DURACOES = {
    diaria: {
        nome: 'Diária',
        diasUteis: 1,
    },
    semanal: {
        nome: 'Semanal',
        diasUteis: 5,
    },
    mensal: {
        nome: 'Mensal',
        diasUteis: 22,
    },
    anual: {
        nome: 'Anual',
        diasUteis: 264,
    },
};

/**
 * Criar um objeto Date sem problemas de conversão de fuso horário.
 */
const criarDataLocal = (data) => {
    if (!data) {
        return null;
    }

    const partes = data.split('-').map(Number);

    if (partes.length !== 3) {
        return null;
    }

    const [ano, mes, dia] = partes;

    return new Date(ano, mes - 1, dia, 12, 0, 0);
};

/**
 * Converter um objeto Date para o formato YYYY-MM-DD.
 */
const formatarDataInput = (data) => {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
        return '';
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
};

/**
 * Apresentar a data no formato português.
 */
const formatarDataPortugues = (data) => {
    const dataLocal = criarDataLocal(data);

    if (!dataLocal) {
        return '';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(dataLocal);
};

/**
 * Verificar se uma data corresponde a sábado ou domingo.
 */
const dataEhFimDeSemana = (data) => {
    const dataLocal = criarDataLocal(data);

    if (!dataLocal) {
        return false;
    }

    const diaSemana = dataLocal.getDay();

    return diaSemana === 0 || diaSemana === 6;
};

/**
 * Calcular a data final contando apenas dias úteis.
 *
 * A data inicial conta como primeiro dia útil.
 */
const calcularDataFim = (dataInicio, tipoDuracao) => {
    if (!dataInicio) {
        return '';
    }

    const dataAtual = criarDataLocal(dataInicio);

    if (!dataAtual) {
        return '';
    }

    const quantidadeDiasUteis =
        DURACOES[tipoDuracao]?.diasUteis ?? 1;

    if (quantidadeDiasUteis === 1) {
        return formatarDataInput(dataAtual);
    }

    /*
     * As reservas longas não devem começar ao fim de semana.
     * O backend também valida esta regra.
     */
    if (dataEhFimDeSemana(dataInicio)) {
        return '';
    }

    let diasContados = 1;

    while (diasContados < quantidadeDiasUteis) {
        dataAtual.setDate(dataAtual.getDate() + 1);

        const diaSemana = dataAtual.getDay();

        if (diaSemana !== 0 && diaSemana !== 6) {
            diasContados += 1;
        }
    }

    return formatarDataInput(dataAtual);
};

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
        junto_janela: false,
        ergonomica: false,
    });

    const [setoresFiltrados, setSetoresFiltrados] =
        useState([]);

    const [lugares, setLugares] = useState([]);

    const [periodosEscolhidos, setPeriodosEscolhidos] =
        useState({});

    const [aReservar, setAReservar] = useState(null);

    const [tipoDuracao, setTipoDuracao] =
        useState('diaria');

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
            return;
        }

        const controlador = new AbortController();

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
            });

        return () => {
            controlador.abort();
        };
    }, [
        filtros.data,
        filtros.setor_id,
        preferencias,
        inicioEmFimDeSemana,
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
                    preserveScroll: true,
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
                preserveScroll: true,
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

                    <div className="mt-5">
                        <p className={labelClass}>
                            Preferências
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {PREFERENCIAS.map(
                                (preferencia) => (
                                    <label
                                        key={
                                            preferencia.key
                                        }
                                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                preferencias[
                                                    preferencia
                                                        .key
                                                ]
                                            }
                                            onChange={() =>
                                                alternarPreferencia(
                                                    preferencia.key,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                        />

                                        {
                                            preferencia.label
                                        }
                                    </label>
                                ),
                            )}
                        </div>
                    </div>

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
                        ) : lugares.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Não existem lugares
                                disponíveis para a data e
                                categoria selecionadas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {lugares.map(
                                    (secretaria) => {
                                        const periodoEscolhido =
                                            reservaLonga
                                                ? 'dia_inteiro'
                                                : periodosEscolhidos[
                                                      secretaria
                                                          .id
                                                  ] ??
                                                  null;

                                        const semDisponibilidade =
                                            periodosReserva.every(
                                                (
                                                    periodo,
                                                ) =>
                                                    !secretaria
                                                        .periodos_disponiveis[
                                                        periodo
                                                            .id
                                                    ],
                                            );

                                        const diaInteiroDisponivel =
                                            periodosReserva.length >
                                                1 &&
                                            periodosReserva.every(
                                                (
                                                    periodo,
                                                ) =>
                                                    secretaria
                                                        .periodos_disponiveis[
                                                        periodo
                                                            .id
                                                    ],
                                            );

                                        const ehAlvo =
                                            secretaria.id ===
                                            secretariaAlvo;

                                        const podeReservar =
                                            reservaLonga
                                                ? diaInteiroDisponivel
                                                : Boolean(
                                                      periodoEscolhido,
                                                  );

                                        return (
                                            <div
                                                key={
                                                    secretaria.id
                                                }
                                                id={`lugar-${secretaria.id}`}
                                                className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${
                                                    ehAlvo
                                                        ? 'border-teal-500 ring-4 ring-teal-500/20'
                                                        : 'border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                {secretaria.imagem ? (
                                                    <img
                                                        src={
                                                            secretaria.imagem
                                                        }
                                                        alt={
                                                            secretaria.codigo
                                                        }
                                                        className="h-40 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                        <ImageOff
                                                            size={
                                                                28
                                                            }
                                                            strokeWidth={
                                                                1.6
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div className="p-4">
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {
                                                            secretaria.codigo
                                                        }
                                                    </p>

                                                    {secretaria.descricao && (
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            {
                                                                secretaria.descricao
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="mt-4 flex gap-2">
                                                        {!reservaLonga &&
                                                            periodosReserva.map(
                                                                (
                                                                    periodo,
                                                                ) => {
                                                                    const disponivel =
                                                                        secretaria
                                                                            .periodos_disponiveis[
                                                                            periodo
                                                                                .id
                                                                        ];

                                                                    const selecionado =
                                                                        periodoEscolhido ===
                                                                        periodo.id;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                periodo.id
                                                                            }
                                                                            type="button"
                                                                            disabled={
                                                                                !disponivel
                                                                            }
                                                                            onClick={() =>
                                                                                escolherPeriodo(
                                                                                    secretaria.id,
                                                                                    periodo.id,
                                                                                )
                                                                            }
                                                                            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                                selecionado
                                                                                    ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                                                    : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                periodo.nome
                                                                            }
                                                                        </button>
                                                                    );
                                                                },
                                                            )}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !diaInteiroDisponivel
                                                            }
                                                            onClick={() =>
                                                                escolherPeriodo(
                                                                    secretaria.id,
                                                                    'dia_inteiro',
                                                                )
                                                            }
                                                            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                periodoEscolhido ===
                                                                'dia_inteiro'
                                                                    ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                                    : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            Dia
                                                            inteiro
                                                        </button>
                                                    </div>

                                                    {!reservaLonga &&
                                                    semDisponibilidade ? (
                                                        <p className="mt-3 text-center text-xs text-slate-400">
                                                            Sem
                                                            disponibilidade
                                                            nesta
                                                            data.
                                                        </p>
                                                    ) : reservaLonga &&
                                                      !diaInteiroDisponivel ? (
                                                        <p className="mt-3 text-center text-xs text-slate-400">
                                                            Dia
                                                            inteiro
                                                            indisponível
                                                            na data
                                                            inicial.
                                                        </p>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !podeReservar ||
                                                                aReservar ===
                                                                    secretaria.id
                                                            }
                                                            onClick={() =>
                                                                reservar(
                                                                    secretaria,
                                                                )
                                                            }
                                                            className="mt-3 w-full rounded-xl bg-teal-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                                                        >
                                                            {aReservar ===
                                                            secretaria.id
                                                                ? 'A reservar...'
                                                                : reservaLonga
                                                                  ? `Reservar de ${formatarDataPortugues(
                                                                        filtros.data,
                                                                    )} a ${formatarDataPortugues(
                                                                        dataFimCalculada,
                                                                    )}`
                                                                  : 'Reservar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
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