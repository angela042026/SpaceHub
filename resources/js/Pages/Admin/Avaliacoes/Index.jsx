import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Search,
    Star,
    ThumbsDown,
    ThumbsUp,
} from 'lucide-react';
import { useState } from 'react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    aprovada: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    rejeitada: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const ESTADO_LABEL = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
};

export default function Index({ avaliacoes, filters }) {
    const [processingId, setProcessingId] = useState(null);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const estadoAtivo = filters.estado ?? 'pendente';

    const filtrar = (estado) => {
        router.get(route('admin.avaliacoes.index'), { estado, search: searchValue }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const pesquisar = (event) => {
        event.preventDefault();

        router.get(route('admin.avaliacoes.index'), { estado: estadoAtivo, search: searchValue }, {
            preserveState: true,
            preserveScroll: true,
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

    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
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
                <p className="max-w-xs truncate" title={avaliacao.comentario}>
                    {avaliacao.comentario}
                </p>
            ),
        },
        {
            key: 'reserva',
            label: 'Reserva',
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
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        ESTADO_CLASSES[avaliacao.estado] ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {ESTADO_LABEL[avaliacao.estado] ?? avaliacao.estado}
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
                            title="Aprovar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
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
                            title="Rejeitar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
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
                        {['pendente', 'aprovada', 'rejeitada', 'todas'].map((estado) => (
                            <button
                                key={estado}
                                type="button"
                                onClick={() => filtrar(estado)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                    estadoAtivo === estado
                                        ? 'bg-navy-900 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {estado === 'todas' ? 'Todas' : ESTADO_LABEL[estado]}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={pesquisar} className="relative w-full sm:w-64">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Pesquisar comentário, nome ou código..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={avaliacoes.data}
                        emptyMessage="Nenhuma avaliação encontrada."
                    />

                    {avaliacoes.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {avaliacoes.meta.current_page} de {avaliacoes.meta.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!avaliacoes.links.prev}
                                    onClick={() => irParaPagina(avaliacoes.links.prev)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!avaliacoes.links.next}
                                    onClick={() => irParaPagina(avaliacoes.links.next)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronRight size={16} strokeWidth={1.9} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
