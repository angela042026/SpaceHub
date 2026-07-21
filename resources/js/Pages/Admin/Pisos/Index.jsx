import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Layers3,
    Pencil,
    Plus,
    Power,
    Search,
} from 'lucide-react';

export default function Index({ pisos, edificios, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        edificio_id: filters.edificio_id ?? '',
        ativo: filters.ativo ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.pisos.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpar = () => {
        router.get(route('admin.pisos.index'));
    };

    const alternarAtivo = (piso) => {
        const mensagem = piso.ativo
            ? `Desativar o piso ${piso.nome}?`
            : `Ativar o piso ${piso.nome}?`;

        if (!confirm(mensagem)) {
            return;
        }

        router.patch(
            route('admin.pisos.toggleAtivo', piso.id),
            {},
            { preserveScroll: true },
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
            label: 'Piso',
            render: (piso) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {piso.nome}
                    </p>
                    <p className="text-xs text-slate-400">{piso.codigo} · nº {piso.numero}</p>
                </div>
            ),
        },
        {
            key: 'edificio',
            label: 'Edifício',
            render: (piso) => piso.edificio ?? '-',
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (piso) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        piso.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {piso.ativo ? 'Ativo' : 'Inativo'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (piso) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.pisos.edit', piso.id)}
                        title="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(piso)}
                        title={piso.ativo ? 'Desativar' : 'Ativar'}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700"
                    >
                        <Power size={16} strokeWidth={1.9} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Pisos" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Layers3 size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Pisos
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {pisos.meta.total} piso{pisos.meta.total === 1 ? '' : 's'} registado{pisos.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.pisos.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        Novo piso
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
                        value={data.edificio_id}
                        onChange={(event) => setData('edificio_id', event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os edifícios</option>

                        {edificios.map((edificio) => (
                            <option key={edificio.id} value={edificio.id}>
                                {edificio.nome}
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
                        data={pisos.data}
                        emptyMessage="Nenhum piso encontrado."
                    />

                    {pisos.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {pisos.meta.current_page} de {pisos.meta.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!pisos.links.prev}
                                    onClick={() => irParaPagina(pisos.links.prev)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!pisos.links.next}
                                    onClick={() => irParaPagina(pisos.links.next)}
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
