import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    MapPinned,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ setores, pisos, filters }) {
    const [processingId, setProcessingId] = useState(null);

    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        piso_id: filters.piso_id ?? '',
        ativo: filters.ativo ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.setores.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpar = () => {
        router.get(route('admin.setores.index'));
    };

    const alternarAtivo = (setor) => {
        const mensagem = setor.ativo
            ? `Desativar o setor ${setor.nome}?`
            : `Ativar o setor ${setor.nome}?`;

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(setor.id);

        router.patch(
            route('admin.setores.toggleAtivo', setor.id),
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
            key: 'nome',
            label: 'Setor',
            render: (setor) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {setor.nome}
                    </p>
                    <p className="text-xs text-slate-400">{setor.codigo}</p>
                </div>
            ),
        },
        {
            key: 'piso',
            label: 'Piso',
            render: (setor) => setor.piso ?? '-',
        },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (setor) => setor.tipo ?? '-',
        },
        {
            key: 'reservavel',
            label: 'Reservável',
            render: (setor) => (setor.reservavel ? 'Sim' : 'Não'),
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (setor) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        setor.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {setor.ativo ? 'Ativo' : 'Inativo'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (setor) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.setores.edit', setor.id)}
                        title="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(setor)}
                        disabled={processingId === setor.id}
                        title={setor.ativo ? 'Desativar' : 'Ativar'}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            setor.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === setor.id ? (
                            <RotateCcw size={16} strokeWidth={1.9} className="animate-spin" />
                        ) : (
                            <Power size={16} strokeWidth={1.9} />
                        )}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Setores" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <MapPinned size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Setores
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {setores.meta.total} setor{setores.meta.total === 1 ? '' : 'es'} registado{setores.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.setores.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        Novo setor
                    </Link>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-[1fr_200px_160px_auto]"
                >
                    <div className="relative">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={data.search}
                            onChange={(event) => setData('search', event.target.value)}
                            placeholder="Pesquisar por nome ou código"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={data.piso_id}
                        onChange={(event) => setData('piso_id', event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os pisos</option>

                        {pisos.map((piso) => (
                            <option key={piso.id} value={piso.id}>
                                {piso.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={data.ativo}
                        onChange={(event) => setData('ativo', event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        <option value="1">Ativos</option>
                        <option value="0">Inativos</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="h-11 flex-1 rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950 sm:flex-none"
                        >
                            Pesquisar
                        </button>

                        <button
                            type="button"
                            onClick={limpar}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700"
                        >
                            Limpar
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={setores.data}
                        emptyMessage="Nenhum setor encontrado."
                    />

                    {setores.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {setores.meta.current_page} de {setores.meta.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!setores.links.prev}
                                    onClick={() => irParaPagina(setores.links.prev)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!setores.links.next}
                                    onClick={() => irParaPagina(setores.links.next)}
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
