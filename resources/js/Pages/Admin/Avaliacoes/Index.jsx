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
import { ESTADO_AVALIACAO, badge, etiqueta } from '@/utils/estados';

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
                        badge(ESTADO_AVALIACAO, avaliacao.estado)
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
                                {estado === 'todas' ? 'Todas' : etiqueta(ESTADO_AVALIACAO, estado)}
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
