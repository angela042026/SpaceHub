import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, router } from '@inertiajs/react';
import {
    Clock,
    MessageSquare,
    RotateCcw,
    Search,
    Star,
    ThumbsDown,
    ThumbsUp,
} from 'lucide-react';
import { useState } from 'react';
import { ESTADO_AVALIACAO, etiqueta } from '@/utils/estados';

// Rótulos no plural, só para os filtros desta página — os estados
// partilhados em utils/estados.js ficam no singular porque também servem
// o badge por linha ("Pendente", não "Pendentes").
const FILTROS_ESTADO = [
    { valor: 'todas', label: 'Todas' },
    { valor: 'pendente', label: 'Pendentes' },
    { valor: 'aprovada', label: 'Aprovadas' },
    { valor: 'rejeitada', label: 'Rejeitadas' },
];

// Cor do badge "Estado" só nesta página: o pendente partilhado
// (bg-amber-500/10 + amber-600) compete visualmente com as estrelas
// (amber-400 preenchido) na mesma linha — aqui fica um tom mais suave sem
// alterar o mapa partilhado, usado também nas páginas de Reservas e
// Minhas Avaliações.
const CORES_ESTADO_AVALIACAO = {
    pendente: 'bg-amber-400/10 text-amber-500 dark:text-amber-400',
    aprovada: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    rejeitada: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

function formatarDecimal(valor) {
    return `${valor}`.replace('.', ',');
}

export default function Index({ avaliacoes, filters, stats }) {
    const [processingId, setProcessingId] = useState(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [carregando, setCarregando] = useState(false);

    const estadoAtivo = filters.estado ?? 'pendente';
    const filtrosAtivos = estadoAtivo !== 'todas' || searchValue !== '';
    const temAprovadas = (stats.porEstado.aprovada ?? 0) > 0;

    // Ponto único de navegação — todas as ações (filtrar, pesquisar,
    // mudar de página, limpar filtros) passam por aqui, partindo sempre
    // do estado/pesquisa atuais e só substituindo o que muda. Garante
    // que nenhuma combinação de filtro + pesquisa + página se perde.
    const visitar = (alteracoes) => {
        router.get(
            route('admin.avaliacoes.index'),
            { estado: estadoAtivo, search: searchValue, ...alteracoes },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setCarregando(true),
                onFinish: () => setCarregando(false),
            },
        );
    };

    // Trocar de filtro ou pesquisar volta sempre à página 1 — sem isto,
    // filtrar a partir da página 3 podia aterrar numa página que já não
    // existe para o novo conjunto de resultados.
    const filtrar = (estado) => visitar({ estado, page: 1 });

    const pesquisar = (event) => {
        event.preventDefault();
        visitar({ search: searchValue, page: 1 });
    };

    const irParaPagina = (pagina) => visitar({ page: pagina });

    const limparFiltros = () => {
        setSearchValue('');
        visitar({ estado: 'todas', search: '', page: 1 });
    };

    const moderar = (avaliacao, acao) => {
        const mensagem = acao === 'aprovar'
            ? `Aprovar esta avaliação de ${avaliacao.reserva?.utilizador ?? 'utilizador'}?`
            : `Rejeitar esta avaliação de ${avaliacao.reserva?.utilizador ?? 'utilizador'}?`;

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(avaliacao.id);

        router.patch(
            route(`admin.avaliacoes.${acao}`, avaliacao.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const columns = [
        {
            key: 'nota',
            label: 'Nota',
            render: (avaliacao) => (
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, indice) => (
                            <Star
                                key={indice}
                                size={14}
                                fill={indice < avaliacao.nota ? 'currentColor' : 'none'}
                                strokeWidth={1.5}
                            />
                        ))}
                    </div>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {formatarDecimal(Number(avaliacao.nota).toFixed(1))}
                    </span>
                </div>
            ),
        },
        {
            key: 'comentario',
            label: 'Comentário',
            render: (avaliacao) => (
                <div className="group relative inline-block max-w-xs">
                    <p className="truncate">{avaliacao.comentario}</p>

                    {/* Popover só aparece se o comentário for longo o suficiente para ser cortado. */}
                    {(avaliacao.comentario?.length ?? 0) > 50 && (
                        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 origin-top-left scale-95 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 opacity-0 shadow-lg transition duration-150 group-hover:scale-100 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {avaliacao.comentario}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'reserva',
            label: 'Utilizador / Reserva',
            render: (avaliacao) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {avaliacao.reserva?.utilizador ?? '-'}
                    </p>

                    <p className="text-xs text-slate-400">
                        {avaliacao.reserva?.secretaria ?? '-'} · {avaliacao.reserva?.setor ?? '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Enviada em',
            render: (avaliacao) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {avaliacao.created_at ? new Date(avaliacao.created_at).toLocaleDateString('pt-PT') : '-'}
                </span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (avaliacao) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        CORES_ESTADO_AVALIACAO[avaliacao.estado] ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {etiqueta(ESTADO_AVALIACAO, avaliacao.estado)}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (avaliacao) => (
                avaliacao.estado === 'pendente' ? (
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => moderar(avaliacao, 'aprovar')}
                            disabled={processingId === avaliacao.id}
                            title="Aprovar avaliação"
                            aria-label="Aprovar avaliação"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-teal-500/10"
                        >
                            {processingId === avaliacao.id ? (
                                <RotateCcw size={16} strokeWidth={1.9} className="animate-spin" />
                            ) : (
                                <ThumbsUp size={16} strokeWidth={1.9} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => moderar(avaliacao, 'rejeitar')}
                            disabled={processingId === avaliacao.id}
                            title="Rejeitar avaliação"
                            aria-label="Rejeitar avaliação"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-red-500/10"
                        >
                            {processingId === avaliacao.id ? (
                                <RotateCcw size={16} strokeWidth={1.9} className="animate-spin" />
                            ) : (
                                <ThumbsDown size={16} strokeWidth={1.9} />
                            )}
                        </button>
                    </div>
                ) : (
                    <p className="text-right text-xs text-slate-400">Já moderada</p>
                )
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Avaliações" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                            <Star size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Avaliações
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Consulte e modere as avaliações enviadas pelos utilizadores.
                            </p>
                        </div>
                    </div>
                </div>

                {/*
                    4 indicadores compactos — bem menores que os cards
                    principais das Estatísticas, sem sparklines nem
                    gráficos. Valores vêm de app/Http/Controllers/Admin/
                    AvaliacaoController::index() (contagens por estado +
                    média das aprovadas), nunca hardcoded.
                */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                <MessageSquare size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Total de Avaliações
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.total}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                <Star size={14} strokeWidth={1.9} fill="currentColor" />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Avaliação Média
                            </span>
                        </div>

                        {temAprovadas ? (
                            <>
                                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                    {formatarDecimal(stats.media)} <span className="text-sm font-semibold text-slate-400">/ 5</span>
                                </p>

                                <div className="mt-1 flex gap-0.5 text-amber-400">
                                    {Array.from({ length: 5 }).map((_, indice) => (
                                        <Star
                                            key={indice}
                                            size={11}
                                            fill={indice < Math.round(stats.media) ? 'currentColor' : 'none'}
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="mt-2 text-xl font-bold text-slate-400 dark:text-slate-500">
                                — <span className="text-sm font-semibold">/ 5</span>
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                <Clock size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Pendentes
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.pendentes}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                <ThumbsUp size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Taxa de Aprovação
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {formatarDecimal(stats.taxaAprovacao)}%
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {FILTROS_ESTADO.map(({ valor, label }) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => filtrar(valor)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    estadoAtivo === valor
                                        ? 'bg-navy-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
                                }`}
                            >
                                {label}

                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                        estadoAtivo === valor
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {stats.porEstado[valor] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={pesquisar} className="relative w-full sm:w-full sm:max-w-[360px]">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Pesquisar avaliações…"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                <div className="relative p-6">
                    <LoadingOverlay show={carregando} />

                    <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {avaliacoes.meta.total} avaliaç{avaliacoes.meta.total === 1 ? 'ão' : 'ões'} encontrada{avaliacoes.meta.total === 1 ? '' : 's'}
                    </p>

                    <Table
                        columns={columns}
                        data={avaliacoes.data}
                        emptyMessage={
                            stats.total === 0 ? (
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                                        Ainda não existem avaliações.
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        As avaliações enviadas pelos utilizadores aparecerão aqui.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                                        Nenhuma avaliação encontrada.
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Experimente alterar os filtros ou a pesquisa.
                                    </p>

                                    {filtrosAtivos && (
                                        <button
                                            type="button"
                                            onClick={limparFiltros}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                                        >
                                            Limpar filtros
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    />

                    <Pagination
                        pagination={avaliacoes}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                        numbered
                        onNavigate={irParaPagina}
                        itemLabel="avaliações"
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
