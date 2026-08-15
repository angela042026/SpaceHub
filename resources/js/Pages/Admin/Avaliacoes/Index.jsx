import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, router } from '@inertiajs/react';
import {
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

export default function Index({ avaliacoes, filters }) {
    const [processingId, setProcessingId] = useState(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [carregando, setCarregando] = useState(false);

    const estadoAtivo = filters.estado ?? 'pendente';

    const filtrar = (estado) => {
        router.get(route('admin.avaliacoes.index'), { estado, search: searchValue }, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    };

    const pesquisar = (event) => {
        event.preventDefault();

        router.get(route('admin.avaliacoes.index'), { estado: estadoAtivo, search: searchValue }, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-green-300 hover:bg-green-50 hover:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-green-500/10"
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
                                {avaliacoes.meta.total} avaliaç{avaliacoes.meta.total === 1 ? 'ão' : 'ões'} encontrada{avaliacoes.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {FILTROS_ESTADO.map(({ valor, label }) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => filtrar(valor)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                    estadoAtivo === valor
                                        ? 'bg-navy-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={pesquisar} className="relative w-full sm:w-80">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Pesquisar por comentário, utilizador ou espaço…"
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                <div className="relative p-6">
                    <LoadingOverlay show={carregando} />

                    <Table
                        columns={columns}
                        data={avaliacoes.data}
                        emptyMessage="Nenhuma avaliação encontrada."
                    />

                    <Pagination
                        pagination={avaliacoes}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
