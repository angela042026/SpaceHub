import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarPlus, ImageOff } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const PREFERENCIAS = [
    { key: 'monitor', label: 'Monitor' },
    { key: 'dock_usb', label: 'Dock USB' },
    { key: 'junto_janela', label: 'Junto à janela' },
    { key: 'ergonomica', label: 'Cadeira ergonómica' },
];

// Imagem por tipo de setor (fallback quando a secretária não tem foto
// própria) — mesmas imagens já usadas no carrossel da landing page.
const IMAGEM_POR_TIPO_SETOR = {
    open_space: '/images/landing/espaco-trabalho.png',
    escritorio: '/images/landing/escritorio-privado.png',
    escritorio_executivo: '/images/landing/escritorio-privado.png',
    sala_reunioes: '/images/landing/saladereuniao.png',
    sala_criativa: '/images/landing/espaco-comum.png',
    sala_espera: '/images/landing/rececao.png',
    rececao: '/images/landing/rececao.png',
    copa: '/images/landing/lounge.png',
    lounge: '/images/landing/lounge.png',
    phone_booth: '/images/landing/phone-booth.png',
};

// Setores com imagem própria (têm prioridade sobre a imagem do tipo).
const IMAGEM_POR_NOME_SETOR = {
    'Sala de Reuniões Redonda': '/images/landing/salamesaredonda.png',
    'Sala Criativa': '/images/landing/salacriativa.png',
    'Sala de Reuniões Média': '/images/landing/salaReunioes.png',
};

export default function Create({ periodos, pisos, setores, filters }) {
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
    const [setoresFiltrados, setSetoresFiltrados] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [periodosEscolhidos, setPeriodosEscolhidos] = useState({});
    const [aReservar, setAReservar] = useState(null);
    const [mostrarTodos, setMostrarTodos] = useState(false);

    // Secretária vinda do mapa do Dashboard (clique numa bolinha), para
    // ir direto àquele lugar em vez de mostrar a lista toda do setor.
    const secretariaAlvo = filters?.secretaria_id ? Number(filters.secretaria_id) : null;

    const lugaresExibidos = secretariaAlvo && !mostrarTodos
        ? lugares.filter((lugar) => lugar.id === secretariaAlvo)
        : lugares;

    const setorSelecionado = setoresFiltrados.find((setor) => setor.id == filtros.setor_id);
    const imagemPorTipo =
        IMAGEM_POR_NOME_SETOR[setorSelecionado?.nome] ??
        IMAGEM_POR_TIPO_SETOR[setorSelecionado?.tipo] ??
        null;

    useEffect(() => {
        if (!secretariaAlvo) {
            return;
        }

        const elemento = document.getElementById(`lugar-${secretariaAlvo}`);
        elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [lugares, secretariaAlvo]);

    // "Dia inteiro" é uma ação especial que cria uma reserva por cada
    // período real. Por isso, não deve ser apresentado como período normal.
    const periodosReserva = periodos.filter(
        (periodo) => periodo.nome !== 'Dia inteiro',
    );

    // Filtra os tipos de espaço conforme o piso selecionado. Mantém o
    // setor atual se continuar válido para o piso (ex: vindo pré-preenchido
    // pela página de Disponibilidade), só o limpa quando o utilizador muda
    // de piso e o setor deixa de pertencer à nova lista.
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
    }, [filtros.piso_id]);

    // Consulta os lugares do setor escolhido, com a disponibilidade por período
    useEffect(() => {
        if (!filtros.data || !filtros.setor_id) {
            setLugares([]);
            return;
        }

        fetch(route('reservas.lugaresPorSetor', {
            data: filtros.data,
            setor_id: filtros.setor_id,
            ...preferencias,
        }), {
            headers: {
                Accept: 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }
                return response.json();
            })
            .then((dados) => setLugares(dados))
            .catch((error) => {
                console.error(error);
                setLugares([]);
            });
    }, [filtros.data, filtros.setor_id, preferencias]);

    const alternarPreferencia = (chave) => {
        setPreferencias((atual) => ({ ...atual, [chave]: !atual[chave] }));
    };

    const escolherPeriodo = (secretariaId, escolha) => {
        setPeriodosEscolhidos((atual) => ({ ...atual, [secretariaId]: escolha }));
    };

    const reservar = (secretaria) => {
        const escolha = periodosEscolhidos[secretaria.id];

        if (!escolha || aReservar) {
            return;
        }

        setAReservar(secretaria.id);

        if (escolha === 'dia_inteiro') {
            router.post(route('reservas.storeDiaInteiro'), {
                data: filtros.data,
                secretaria_id: secretaria.id,
            }, {
                onFinish: () => setAReservar(null),
            });
            return;
        }

        router.post(route('reservas.store'), {
            data: filtros.data,
            periodo_id: escolha,
            secretaria_id: secretaria.id,
        }, {
            onFinish: () => setAReservar(null),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Nova Reserva" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarPlus size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Nova Reserva
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Escolhe a data e o tipo de espaço, depois seleciona o período e reserva.
                        </p>
                    </div>
                </div>

                <div className="p-6">
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

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <label htmlFor="data" className={labelClass}>Data</label>
                            <input
                                id="data"
                                type="date"
                                value={filtros.data}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, data: e.target.value }))}
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="piso_id" className={labelClass}>Piso</label>
                            <select
                                id="piso_id"
                                value={filtros.piso_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, piso_id: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">Selecione...</option>

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
                                className={fieldClass}
                            >
                                <option value="">
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

                    <div className="mt-5">
                        <p className={labelClass}>Preferências</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {PREFERENCIAS.map((preferencia) => (
                                <label
                                    key={preferencia.key}
                                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    <input
                                        type="checkbox"
                                        checked={preferencias[preferencia.key]}
                                        onChange={() => alternarPreferencia(preferencia.key)}
                                        className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                    />
                                    {preferencia.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        {!filtros.data || !filtros.setor_id ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Escolhe a data, o piso e a categoria do espaço para veres os lugares disponíveis.
                            </p>
                        ) : lugares.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Não existem lugares disponíveis para a data e categoria selecionadas.
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
                                {lugaresExibidos.map((secretaria) => {
                                    const periodoEscolhido = periodosEscolhidos[secretaria.id] ?? null;
                                    const semDisponibilidade = periodosReserva.every(
                                        (periodo) => !secretaria.periodos_disponiveis[periodo.id],
                                    );
                                    const diaInteiroDisponivel = periodosReserva.length > 1 && periodosReserva.every(
                                        (periodo) => secretaria.periodos_disponiveis[periodo.id],
                                    );
                                    const ehAlvo = secretaria.id === secretariaAlvo;

                                    return (
                                        <div
                                            key={secretaria.id}
                                            id={`lugar-${secretaria.id}`}
                                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${
                                                ehAlvo
                                                    ? 'border-teal-500 ring-4 ring-teal-500/20'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            {secretaria.imagem || imagemPorTipo ? (
                                                <img
                                                    src={secretaria.imagem || imagemPorTipo}
                                                    alt={secretaria.codigo}
                                                    className="h-40 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                    <ImageOff size={28} strokeWidth={1.6} />
                                                </div>
                                            )}

                                            <div className="p-4">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {secretaria.codigo}
                                                </p>

                                                {secretaria.descricao && (
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        {secretaria.descricao}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex gap-2">
                                                    {periodosReserva.map((periodo) => {
                                                        const disponivel = secretaria.periodos_disponiveis[periodo.id];
                                                        const selecionado = periodoEscolhido === periodo.id;

                                                        return (
                                                            <button
                                                                key={periodo.id}
                                                                type="button"
                                                                disabled={!disponivel}
                                                                onClick={() => escolherPeriodo(secretaria.id, periodo.id)}
                                                                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                    selecionado
                                                                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                                        : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {periodo.nome}
                                                            </button>
                                                        );
                                                    })}

                                                    <button
                                                        type="button"
                                                        disabled={!diaInteiroDisponivel}
                                                        onClick={() => escolherPeriodo(secretaria.id, 'dia_inteiro')}
                                                        className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                            periodoEscolhido === 'dia_inteiro'
                                                                ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                                : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        Dia inteiro
                                                    </button>
                                                </div>

                                                {semDisponibilidade ? (
                                                    <p className="mt-3 text-center text-xs text-slate-400">
                                                        Sem disponibilidade nesta data.
                                                    </p>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={!periodoEscolhido || aReservar === secretaria.id}
                                                        onClick={() => reservar(secretaria)}
                                                        className="mt-3 w-full rounded-xl bg-teal-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                                                    >
                                                        {aReservar === secretaria.id ? 'A reservar...' : 'Reservar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <Link
                            href={route('reservas.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Cancelar
                        </Link>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}