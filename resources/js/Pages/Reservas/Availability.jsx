import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Inbox,
    RotateCcw,
    Search,
    Sun,
    Sunset,
    X,
} from 'lucide-react';
import Modal from '@/Components/Modal';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { formatarDataPortugues, proximaDataValida } from '@/Components/Reservas/reservaHelpers';
import { etiquetaPeriodo } from '@/utils/estados';
import { RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT } from '@/Lib/reservaAlteracaoBar';

const QUANTIDADE_POR_PAGINA = 12;
const DEBOUNCE_MS = 350;
const DEBOUNCE_PESQUISA_MS = 300;

/**
 * Compara texto ignorando maiúsculas/minúsculas e acentos — para
 * "escritorio" encontrar "Escritório", por exemplo.
 */
function normalizarTexto(texto) {
    return (texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const botaoReservarDesktopClass =
    'inline-flex items-center justify-center rounded-lg border border-teal-500 px-4 py-1.5 text-xs font-bold text-teal-600 transition-colors duration-200 hover:bg-teal-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:hover:text-white dark:focus-visible:ring-offset-slate-900';

const botaoReservarMobileClass =
    'flex w-full shrink-0 items-center justify-center rounded-xl bg-teal-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 sm:w-auto sm:min-w-32 sm:px-5 dark:focus-visible:ring-offset-slate-900';

/**
 * Nome de exibição de um espaço — igual em toda a área de reservas
 * (ex.: "Phone Booth 01"), a partir da categoria (setor) e do número
 * final do código.
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

function PillPeriodo({ disponivel }) {
    const { t } = useTranslation('reservas');

    return disponivel ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
            <CheckCircle2 size={13} strokeWidth={2} />
            {t('disponibilidade.livre')}
        </span>
    ) : (
        <span className="inline-flex h-6 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            —
        </span>
    );
}

function PillPeriodoRotulada({ nome, disponivel }) {
    const { t } = useTranslation('reservas');

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            {nome}
            {disponivel ? (
                <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 size={12} strokeWidth={2} />
                    {t('disponibilidade.livre')}
                </span>
            ) : (
                <span className="text-slate-400 dark:text-slate-500">—</span>
            )}
        </span>
    );
}

export default function Availability({ periodos, pisos, setores, edificios, filters }) {
    const { t, i18n } = useTranslation('reservas');
    const { t: tc } = useTranslation('common');

    const periodosMeioDia = periodos.filter((periodo) => periodo.nome !== 'Dia inteiro');
    const periodoDiaInteiro = periodos.find((periodo) => periodo.nome === 'Dia inteiro');
    const periodoManha = periodosMeioDia.find((periodo) => periodo.nome === 'Manhã');
    const periodoTarde = periodosMeioDia.find((periodo) => periodo.nome === 'Tarde');

    // Com um único edifício ativo, esse é "o edifício atual"; com mais
    // do que um, começa em "Todos os edifícios" (não há um óbvio).
    const edificioPadrao = edificios.length === 1 ? String(edificios[0].id) : '';

    const filtrosPadrao = {
        data: proximaDataValida(),
        periodo_id: '',
        edificio_id: edificioPadrao,
        piso_id: '',
        setor_id: '',
    };

    const [filtros, setFiltros] = useState({
        data: filters?.data || filtrosPadrao.data,
        periodo_id: filters?.periodo_id ?? '',
        edificio_id: filters?.edificio_id ?? edificioPadrao,
        piso_id: filters?.piso_id ?? '',
        setor_id: filters?.setor_id ?? '',
    });

    const [pesquisa, setPesquisa] = useState('');
    const [pesquisaAplicada, setPesquisaAplicada] = useState('');

    const [lugares, setLugares] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(false);
    const [tentativa, setTentativa] = useState(0);
    const [quantidadeVisivel, setQuantidadeVisivel] = useState(QUANTIDADE_POR_PAGINA);
    const [secretariaParaEscolherPeriodo, setSecretariaParaEscolherPeriodo] = useState(null);
    const primeiraCargaFeitaRef = useRef(false);

    // Pesquisa por código/nome — só filtra os dados já carregados (sem
    // pedido novo ao servidor), mas ainda assim com debounce, para não
    // recalcular a lista a cada tecla.
    useEffect(() => {
        const temporizador = setTimeout(() => {
            setPesquisaAplicada(pesquisa);
        }, DEBOUNCE_PESQUISA_MS);

        return () => clearTimeout(temporizador);
    }, [pesquisa]);

    // Pisos e categorias disponíveis vão-se estreitando com o edifício e
    // o piso escolhidos, mas nunca ficam bloqueados/desativados — sem
    // filtro nenhum, mostram sempre tudo.
    const pisosFiltrados = filtros.edificio_id
        ? pisos.filter((piso) => String(piso.edificio_id) === filtros.edificio_id)
        : pisos;

    const setoresFiltrados = filtros.piso_id
        ? setores.filter((setor) => String(setor.piso_id) === filtros.piso_id)
        : filtros.edificio_id
            ? setores.filter((setor) =>
                pisosFiltrados.some((piso) => String(piso.id) === String(setor.piso_id)),
            )
            : setores;

    // Se o piso deixar de pertencer ao edifício escolhido, ou a
    // categoria deixar de pertencer ao piso escolhido, ambos voltam a
    // "Todos/Todas" — nunca ficam presos a um valor já inválido.
    useEffect(() => {
        setFiltros((atual) => {
            if (!atual.piso_id) {
                return atual;
            }

            const aindaValido = pisosFiltrados.some(
                (piso) => String(piso.id) === atual.piso_id,
            );

            return aindaValido ? atual : { ...atual, piso_id: '' };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.edificio_id]);

    useEffect(() => {
        setFiltros((atual) => {
            if (!atual.setor_id) {
                return atual;
            }

            const aindaValido = setoresFiltrados.some(
                (setor) => String(setor.id) === atual.setor_id,
            );

            return aindaValido ? atual : { ...atual, setor_id: '' };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.piso_id, filtros.edificio_id]);

    // Volta aos primeiros QUANTIDADE_POR_PAGINA resultados sempre que
    // algum filtro muda — incluindo o período e a pesquisa, que são
    // filtrados do lado do cliente.
    useEffect(() => {
        setQuantidadeVisivel(QUANTIDADE_POR_PAGINA);
    }, [
        filtros.data,
        filtros.periodo_id,
        filtros.edificio_id,
        filtros.piso_id,
        filtros.setor_id,
        pesquisaAplicada,
    ]);

    // Busca os lugares (com disponibilidade por período) para a
    // data/edifício/piso/categoria escolhidos. O período é filtrado à
    // parte, do lado do cliente, sobre estes mesmos dados — por isso não
    // entra nas dependências deste pedido. Com debounce e
    // AbortController para não aplicar uma resposta que já não
    // corresponde aos filtros atuais.
    useEffect(() => {
        if (!filtros.data) {
            setLugares([]);
            setErro(false);
            setCarregando(false);
            return;
        }

        setCarregando(true);
        setErro(false);

        const controlador = new AbortController();

        const temporizador = setTimeout(() => {
            fetch(
                route('reservas.lugaresPorSetor', {
                    data: filtros.data,
                    ...(filtros.setor_id ? { setor_id: filtros.setor_id } : {}),
                    ...(filtros.piso_id ? { piso_id: filtros.piso_id } : {}),
                    ...(filtros.edificio_id ? { edificio_id: filtros.edificio_id } : {}),
                }),
                {
                    headers: { Accept: 'application/json' },
                    signal: controlador.signal,
                },
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Erro ao consultar disponibilidade.');
                    }

                    return response.json();
                })
                .then((dados) => {
                    setLugares(dados);
                    setCarregando(false);
                    primeiraCargaFeitaRef.current = true;
                })
                .catch((error) => {
                    if (error.name === 'AbortError') {
                        return;
                    }

                    console.error(error);
                    setLugares([]);
                    setErro(true);
                    setCarregando(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(temporizador);
            controlador.abort();
        };
    }, [filtros.data, filtros.edificio_id, filtros.piso_id, filtros.setor_id, tentativa]);

    const filtrosAlterados =
        pesquisa !== '' ||
        filtros.data !== filtrosPadrao.data ||
        filtros.periodo_id !== '' ||
        filtros.edificio_id !== edificioPadrao ||
        filtros.piso_id !== '' ||
        filtros.setor_id !== '';

    const limparFiltros = () => {
        setPesquisa('');
        setPesquisaAplicada('');
        setFiltros({ ...filtrosPadrao, edificio_id: edificioPadrao });
    };

    // Pesquisa por código/nome — aplica-se tanto à lista como aos
    // indicadores compactos (ao contrário do período, que só filtra a
    // lista: os indicadores mostram sempre os três períodos lado a
    // lado, mesmo com um período específico escolhido no filtro).
    const pesquisaNormalizada = normalizarTexto(pesquisaAplicada.trim());

    const correspondeAPesquisa = (secretaria) => {
        if (!pesquisaNormalizada) {
            return true;
        }

        const alvoPesquisa = normalizarTexto(`${secretaria.codigo ?? ''} ${nomeEspaco(secretaria)}`);

        return alvoPesquisa.includes(pesquisaNormalizada);
    };

    const lugaresParaContagem = lugares.filter(correspondeAPesquisa);

    // Lista efetivamente mostrada — filtrada pelo período escolhido
    // (quando não é "Todos os períodos") por cima da pesquisa.
    const lugaresListados = lugaresParaContagem.filter((secretaria) => {
        if (filtros.periodo_id === 'dia_inteiro') {
            return periodosMeioDia.every((periodo) => secretaria.periodos_disponiveis[periodo.id]);
        }

        if (filtros.periodo_id) {
            return Boolean(secretaria.periodos_disponiveis[filtros.periodo_id]);
        }

        return periodosMeioDia.some((periodo) => secretaria.periodos_disponiveis[periodo.id]);
    });

    const lugaresPaginados = lugaresListados.slice(0, quantidadeVisivel);
    const existemMaisLugares = lugaresListados.length > quantidadeVisivel;

    // Indicadores compactos — sobre os edifício/piso/categoria/pesquisa
    // escolhidos, independentemente do período selecionado no filtro.
    const contagemManha = periodoManha
        ? lugaresParaContagem.filter((secretaria) => secretaria.periodos_disponiveis[periodoManha.id]).length
        : 0;
    const contagemTarde = periodoTarde
        ? lugaresParaContagem.filter((secretaria) => secretaria.periodos_disponiveis[periodoTarde.id]).length
        : 0;
    const contagemDiaInteiro = lugaresParaContagem.filter((secretaria) =>
        periodosMeioDia.every((periodo) => secretaria.periodos_disponiveis[periodo.id]),
    ).length;

    const edificioSelecionado = edificios.find(
        (edificio) => String(edificio.id) === filtros.edificio_id,
    );

    // periodoId explícito serve para a escolha feita dentro do modal
    // "Escolha o período" — sem ele, usa o período do filtro (quando
    // houver um específico selecionado).
    const construirLinkReservar = (secretaria, periodoId = filtros.periodo_id) =>
        route('reservas.create', {
            data: filtros.data,
            secretaria_id: secretaria.id,
            ...(filtros.piso_id ? { piso_id: filtros.piso_id } : {}),
            ...(filtros.setor_id ? { setor_id: filtros.setor_id } : {}),
            ...(periodoId ? { periodo_id: periodoId } : {}),
        });

    // Períodos realmente livres para o espaço do modal "Escolha o
    // período" — só entram os que a própria secretária tem disponíveis,
    // nunca um período ocupado.
    const periodosParaEscolher = secretariaParaEscolherPeriodo
        ? [
            ...periodosMeioDia
                .filter((periodo) => secretariaParaEscolherPeriodo.periodos_disponiveis[periodo.id])
                .map((periodo) => ({ valor: periodo.id, nome: periodo.nome })),
            ...(periodoDiaInteiro
                && periodosMeioDia.every((periodo) => secretariaParaEscolherPeriodo.periodos_disponiveis[periodo.id])
                ? [{ valor: 'dia_inteiro', nome: periodoDiaInteiro.nome }]
                : []),
        ]
        : [];

    const mostrarSkeleton = carregando && !primeiraCargaFeitaRef.current;
    const aAtualizar = carregando && primeiraCargaFeitaRef.current;

    // Esta página tem uma coluna de ação junto à margem direita — reusa
    // o mesmo evento global que já afasta o ChatWidget para não tapar
    // os botões "Reservar" (mesmo mecanismo usado pela barra fixa de
    // Reservas/Edit.jsx). Só ativo enquanto há linhas visíveis.
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                detail: { visible: lugaresPaginados.length > 0 },
            }),
        );

        return () => {
            window.dispatchEvent(
                new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                    detail: { visible: false },
                }),
            );
        };
    }, [lugaresPaginados.length]);

    return (
        <DashboardLayout>
            <Head title={t('disponibilidade.tituloPagina')} />

            <div className="pb-28">
                <section className="dashboard-card overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <Search size={22} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('disponibilidade.tituloPagina')}
                                </h1>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('disponibilidade.subtitulo')}
                                </p>
                            </div>
                        </div>

                        {filtrosAlterados && (
                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="self-start text-sm font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900 sm:self-auto"
                            >
                                {t('disponibilidade.limparFiltros')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,1.45fr)_repeat(5,minmax(10rem,1fr))]">
                        <div className="sm:col-span-2 xl:col-span-1">
                            <label htmlFor="pesquisa" className={labelClass}>{t('disponibilidade.pesquisar')}</label>
                            <div className="relative">
                                <Search
                                    size={16}
                                    strokeWidth={1.9}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="pesquisa"
                                    type="text"
                                    value={pesquisa}
                                    onChange={(e) => setPesquisa(e.target.value)}
                                    placeholder={t('disponibilidade.pesquisarPlaceholder')}
                                    aria-label={t('disponibilidade.pesquisarAriaLabel')}
                                    className={`${fieldClass} pl-9 ${pesquisa ? 'pr-9' : ''}`}
                                />

                                {pesquisa && (
                                    <button
                                        type="button"
                                        onClick={() => setPesquisa('')}
                                        aria-label={t('disponibilidade.limparPesquisa')}
                                        className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                    >
                                        <X size={14} strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="data" className={labelClass}>{t('disponibilidade.data')}</label>
                            <input
                                id="data"
                                type="date"
                                value={filtros.data}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, data: e.target.value }))}
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="periodo_id" className={labelClass}>{t('disponibilidade.periodo')}</label>
                            <select
                                id="periodo_id"
                                value={filtros.periodo_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, periodo_id: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">{t('disponibilidade.todosOsPeriodos')}</option>

                                {periodosMeioDia.map((periodo) => (
                                    <option key={periodo.id} value={periodo.id}>
                                        {etiquetaPeriodo(periodo.nome, tc)}
                                    </option>
                                ))}

                                {periodoDiaInteiro && (
                                    <option value="dia_inteiro">{etiquetaPeriodo(periodoDiaInteiro.nome, tc)}</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="edificio_id" className={labelClass}>{t('disponibilidade.edificio')}</label>
                            <select
                                id="edificio_id"
                                value={filtros.edificio_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, edificio_id: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">{t('disponibilidade.todosOsEdificios')}</option>

                                {edificios.map((edificio) => (
                                    <option key={edificio.id} value={edificio.id}>
                                        {edificio.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="piso_id" className={labelClass}>{t('disponibilidade.piso')}</label>
                            <select
                                id="piso_id"
                                value={filtros.piso_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, piso_id: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">{t('disponibilidade.todosOsPisos')}</option>

                                {pisosFiltrados.map((piso) => (
                                    <option key={piso.id} value={piso.id}>
                                        {piso.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="setor_id" className={labelClass}>{t('disponibilidade.categoria')}</label>
                            <select
                                id="setor_id"
                                value={filtros.setor_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, setor_id: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">{t('disponibilidade.todasAsCategorias')}</option>

                                {setoresFiltrados.map((setor) => (
                                    <option key={setor.id} value={setor.id}>
                                        {setor.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    {t('disponibilidade.disponibilidadePara', { data: formatarDataPortugues(filtros.data, i18n.language) })}
                                </h2>

                                <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    {mostrarSkeleton ? (
                                        t('disponibilidade.aCarregar')
                                    ) : (
                                        <>
                                            {t('disponibilidade.espacoDisponivelEm', {
                                                count: lugaresListados.length,
                                                local: edificioSelecionado
                                                    ? t('disponibilidade.emEdificio', { edificio: edificioSelecionado.nome })
                                                    : t('disponibilidade.emTodosOsEdificios'),
                                            })}
                                            {aAtualizar && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                                                    <RotateCcw size={12} strokeWidth={2} className="animate-spin" />
                                                    {t('disponibilidade.aAtualizar')}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                {periodoManha && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-500 shadow-sm dark:bg-slate-900">
                                            <Sun size={16} strokeWidth={1.9} />
                                        </span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{etiquetaPeriodo(periodoManha.nome, tc)}</p>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{contagemManha}</p>
                                        </div>
                                    </div>
                                )}

                                {periodoTarde && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-500 shadow-sm dark:bg-slate-900">
                                            <Sunset size={16} strokeWidth={1.9} />
                                        </span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{etiquetaPeriodo(periodoTarde.nome, tc)}</p>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{contagemTarde}</p>
                                        </div>
                                    </div>
                                )}

                                {periodoDiaInteiro && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-500 shadow-sm dark:bg-slate-900">
                                            <CalendarClock size={16} strokeWidth={1.9} />
                                        </span>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{etiquetaPeriodo(periodoDiaInteiro.nome, tc)}</p>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{contagemDiaInteiro}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {erro ? (
                            <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={18} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                                    <span>{t('disponibilidade.erroCarregarEspacos')}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setTentativa((atual) => atual + 1)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10"
                                >
                                    <RotateCcw size={14} strokeWidth={2} />
                                    {t('disponibilidade.tentarNovamente')}
                                </button>
                            </div>
                        ) : mostrarSkeleton ? (
                            <>
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full border-collapse text-sm">
                                        <tbody>
                                            {Array.from({ length: 6 }).map((_, indice) => (
                                                <tr key={indice} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
                                                    <td className="py-3 pr-4"><div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800" /></td>
                                                    <td className="py-3 pr-4"><div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" /></td>
                                                    <td className="py-3 pr-4"><div className="mx-auto h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" /></td>
                                                    <td className="py-3 pr-4"><div className="mx-auto h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" /></td>
                                                    <td className="py-3 pr-4"><div className="mx-auto h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" /></td>
                                                    <td className="py-3 pl-4"><div className="ml-auto h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 lg:hidden">
                                    {Array.from({ length: 4 }).map((_, indice) => (
                                        <div key={indice} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                            <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                                            <div className="mt-2 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                                            <div className="mt-3 flex gap-2">
                                                <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                                                <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                                                <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
                                            </div>
                                            <div className="mt-3 h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : lugaresListados.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-800/40">
                                <Inbox size={28} strokeWidth={1.6} className="mb-1 text-slate-300 dark:text-slate-600" />

                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {t('disponibilidade.nenhumEspacoEncontrado')}
                                </p>

                                <p className="text-sm text-slate-400 dark:text-slate-500">
                                    {t('disponibilidade.experimenteAlterarFiltros')}
                                </p>

                                <button
                                    type="button"
                                    onClick={limparFiltros}
                                    className="mt-1 text-xs font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                                >
                                    {t('disponibilidade.limparFiltros')}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full border-collapse text-sm">
                                        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                                            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                                                <th className="py-2 pr-4 font-semibold">{t('disponibilidade.colunaEspaco')}</th>
                                                <th className="py-2 pr-4 font-semibold">{t('disponibilidade.colunaLocalizacao')}</th>
                                                <th className="py-2 pr-4 text-center font-semibold">{tc('estados.periodo.manha')}</th>
                                                <th className="py-2 pr-4 text-center font-semibold">{tc('estados.periodo.tarde')}</th>
                                                <th className="py-2 pr-4 text-center font-semibold">{tc('estados.periodo.diaInteiro')}</th>
                                                <th className="py-2 pl-4 text-right font-semibold">{t('disponibilidade.colunaAcao')}</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {lugaresPaginados.map((secretaria) => (
                                                <tr
                                                    key={secretaria.id}
                                                    className="transition-colors duration-150 hover:bg-teal-50/60 focus-within:bg-teal-50/60 dark:hover:bg-teal-400/5 dark:focus-within:bg-teal-400/5"
                                                >
                                                    <td className="py-3 pr-4 align-middle">
                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                            <span className="shrink-0 rounded-[9px] bg-[#E9F8F6] px-2 py-1 text-[11px] font-bold text-[#0FA89E] dark:bg-teal-400/10 dark:text-teal-300">
                                                                {secretaria.codigo}
                                                            </span>
                                                            <span className="truncate font-semibold text-slate-900 dark:text-white">
                                                                {nomeEspaco(secretaria)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3 pr-4 align-middle">
                                                        <LocalizacaoEspaco secretaria={secretaria} />
                                                    </td>

                                                    <td className="py-3 pr-4 text-center align-middle">
                                                        <PillPeriodo
                                                            disponivel={Boolean(
                                                                periodoManha && secretaria.periodos_disponiveis[periodoManha.id],
                                                            )}
                                                        />
                                                    </td>

                                                    <td className="py-3 pr-4 text-center align-middle">
                                                        <PillPeriodo
                                                            disponivel={Boolean(
                                                                periodoTarde && secretaria.periodos_disponiveis[periodoTarde.id],
                                                            )}
                                                        />
                                                    </td>

                                                    <td className="py-3 pr-4 text-center align-middle">
                                                        <PillPeriodo
                                                            disponivel={periodosMeioDia.every(
                                                                (periodo) => secretaria.periodos_disponiveis[periodo.id],
                                                            )}
                                                        />
                                                    </td>

                                                    <td className="py-3 pl-4 text-right align-middle">
                                                        {filtros.periodo_id ? (
                                                            <Link
                                                                href={construirLinkReservar(secretaria)}
                                                                className={botaoReservarDesktopClass}
                                                            >
                                                                {t('disponibilidade.reservar')}
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSecretariaParaEscolherPeriodo(secretaria)}
                                                                aria-haspopup="dialog"
                                                                aria-label={t('disponibilidade.reservarAriaLabel', { espaco: nomeEspaco(secretaria) })}
                                                                className={botaoReservarDesktopClass}
                                                            >
                                                                {t('disponibilidade.reservar')}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 lg:hidden">
                                    {lugaresPaginados.map((secretaria) => (
                                        <div
                                            key={secretaria.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className="shrink-0 rounded-[9px] bg-[#E9F8F6] px-2 py-1 text-[11px] font-bold text-[#0FA89E] dark:bg-teal-400/10 dark:text-teal-300">
                                                    {secretaria.codigo}
                                                </span>
                                                <span className="truncate font-semibold text-slate-900 dark:text-white">
                                                    {nomeEspaco(secretaria)}
                                                </span>
                                            </div>

                                            <LocalizacaoEspaco secretaria={secretaria} className="mt-1.5" />

                                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {periodoManha && (
                                                        <PillPeriodoRotulada
                                                            nome={etiquetaPeriodo(periodoManha.nome, tc)}
                                                            disponivel={Boolean(secretaria.periodos_disponiveis[periodoManha.id])}
                                                        />
                                                    )}

                                                    {periodoTarde && (
                                                        <PillPeriodoRotulada
                                                            nome={etiquetaPeriodo(periodoTarde.nome, tc)}
                                                            disponivel={Boolean(secretaria.periodos_disponiveis[periodoTarde.id])}
                                                        />
                                                    )}

                                                    {periodoDiaInteiro && (
                                                        <PillPeriodoRotulada
                                                            nome={etiquetaPeriodo(periodoDiaInteiro.nome, tc)}
                                                            disponivel={periodosMeioDia.every(
                                                                (periodo) => secretaria.periodos_disponiveis[periodo.id],
                                                            )}
                                                        />
                                                    )}
                                                </div>

                                                {filtros.periodo_id ? (
                                                    <Link
                                                        href={construirLinkReservar(secretaria)}
                                                        className={botaoReservarMobileClass}
                                                    >
                                                        {t('disponibilidade.reservar')}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSecretariaParaEscolherPeriodo(secretaria)}
                                                        aria-haspopup="dialog"
                                                        aria-label={t('disponibilidade.reservarAriaLabel', { espaco: nomeEspaco(secretaria) })}
                                                        className={botaoReservarMobileClass}
                                                    >
                                                        {t('disponibilidade.reservar')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
                                            <CheckCircle2 size={12} strokeWidth={2.2} />
                                        </span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{t('disponibilidade.livre')}</span>
                                        <span className="text-slate-400 dark:text-slate-500">{t('disponibilidade.espacoDisponivelLegenda')}</span>
                                    </span>

                                    <span className="inline-flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">—</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{t('disponibilidade.ocupado')}</span>
                                        <span className="text-slate-400 dark:text-slate-500">{t('disponibilidade.espacoNaoDisponivelLegenda')}</span>
                                    </span>
                                </div>

                                <div className="mt-6 flex flex-col items-center gap-3">
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {t('disponibilidade.aMostrarDe', {
                                            count: lugaresListados.length,
                                            mostrados: lugaresPaginados.length,
                                            total: lugaresListados.length,
                                        })}
                                    </p>

                                    {existemMaisLugares && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantidadeVisivel((atual) => atual + QUANTIDADE_POR_PAGINA)
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-500/50 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:text-teal-400 dark:focus-visible:ring-offset-slate-900"
                                        >
                                            {t('disponibilidade.carregarMaisEspacos')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <Modal
                show={secretariaParaEscolherPeriodo !== null}
                onClose={() => setSecretariaParaEscolherPeriodo(null)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('disponibilidade.modalEscolherPeriodo.titulo')}
                            </h2>

                            {secretariaParaEscolherPeriodo && (
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {nomeEspaco(secretariaParaEscolherPeriodo)} · {secretariaParaEscolherPeriodo.codigo}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setSecretariaParaEscolherPeriodo(null)}
                            aria-label={t('disponibilidade.modalEscolherPeriodo.fechar')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        >
                            <X size={16} strokeWidth={2} />
                        </button>
                    </div>

                    <div className="mt-5 space-y-2.5">
                        {periodosParaEscolher.map((opcao) => (
                            <Link
                                key={opcao.valor}
                                href={construirLinkReservar(secretariaParaEscolherPeriodo, opcao.valor)}
                                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:bg-teal-400/10 dark:hover:text-teal-300 dark:focus-visible:ring-offset-slate-900"
                            >
                                {etiquetaPeriodo(opcao.nome, tc)}
                            </Link>
                        ))}
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
