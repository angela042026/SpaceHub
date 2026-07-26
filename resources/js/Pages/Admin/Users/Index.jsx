import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';

const ESTADO_BADGE = {
    true: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    false: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function Index({ users, roles, filters }) {
    const [processingId, setProcessingId] = useState(null);

    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        role_id: filters.role_id ?? '',
        ativo: filters.ativo ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.users.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpar = () => {
        router.get(route('admin.users.index'));
    };

    const alternarAtivo = (user) => {
        const mensagem = user.ativo
            ? `Desativar a conta de ${user.name}?`
            : `Ativar a conta de ${user.name}?`;

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(user.id);

        router.patch(
            route('admin.users.toggleAtivo', user.id),
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
            key: 'name',
            label: 'Utilizador',
            render: (user) => (
                <div className="flex items-center gap-3">
                    {user.fotografia_url ? (
                        <img
                            src={user.fotografia_url}
                            alt={user.name}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-600 dark:text-teal-400">
                            {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                            {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                            {user.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Papel',
            render: (user) => user.role ?? '-',
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (user) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_BADGE[String(user.ativo)]}`}
                >
                    {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (user) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.users.edit', user.id)}
                        title="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(user)}
                        disabled={processingId === user.id}
                        title={user.ativo ? 'Desativar' : 'Ativar'}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === user.id ? (
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
            <Head title="Utilizadores" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <UserRound size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Utilizadores
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {users.meta.total} utilizador{users.meta.total === 1 ? '' : 'es'} registado{users.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.users.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        Novo utilizador
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
                            placeholder="Pesquisar por nome ou e-mail"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={data.role_id}
                        onChange={(event) => setData('role_id', event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os papéis</option>

                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.nome}
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
                        data={users.data}
                        emptyMessage="Nenhum utilizador encontrado."
                    />

                    {users.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {users.meta.current_page} de {users.meta.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!users.links.prev}
                                    onClick={() => irParaPagina(users.links.prev)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!users.links.next}
                                    onClick={() => irParaPagina(users.links.next)}
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
