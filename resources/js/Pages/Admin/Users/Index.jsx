import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ESTADO_UTILIZADOR, badge, etiqueta } from '@/utils/estados';

export default function Index({ users, roles, filters }) {
    const { auth } = usePage().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [roleId, setRoleId] = useState(filters.role_id ?? '');
    const [ativoFiltro, setAtivoFiltro] = useState(filters.ativo ?? '');
    const [carregando, setCarregando] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [confirmando, setConfirmando] = useState(null);
    const primeiraRenderizacao = useRef(true);

    const irComFiltros = (valores) => {
        router.get(route('admin.users.index'), valores, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    };

    // Pesquisa automática, com debounce, enquanto o utilizador escreve.
    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const temporizador = setTimeout(() => {
            irComFiltros({ search, role_id: roleId, ativo: ativoFiltro });
        }, 350);

        return () => clearTimeout(temporizador);
    }, [search]);

    const pesquisarAgora = () => {
        irComFiltros({ search, role_id: roleId, ativo: ativoFiltro });
    };

    const handleRoleChange = (value) => {
        setRoleId(value);
        irComFiltros({ search, role_id: value, ativo: ativoFiltro });
    };

    const handleAtivoChange = (value) => {
        setAtivoFiltro(value);
        irComFiltros({ search, role_id: roleId, ativo: value });
    };

    const limparPesquisa = () => {
        setSearch('');
        irComFiltros({ search: '', role_id: roleId, ativo: ativoFiltro });
    };

    const limparTudo = () => {
        setSearch('');
        setRoleId('');
        setAtivoFiltro('');
        irComFiltros({});
    };

    const executarToggle = (user) => {
        setProcessingId(user.id);

        router.patch(
            route('admin.users.toggleAtivo', user.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessingId(null);
                    setConfirmando(null);
                },
            },
        );
    };

    const pedirAlternarAtivo = (user) => {
        if (user.ativo) {
            setConfirmando(user);
            return;
        }

        executarToggle(user);
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
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge(ESTADO_UTILIZADOR, String(user.ativo))}`}
                >
                    {etiqueta(ESTADO_UTILIZADOR, String(user.ativo))}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (user) => {
                const ehContaPropria = user.id === auth.user.id;
                const impedirDesativar = user.ativo && ehContaPropria;

                return (
                    <div className="flex justify-end gap-2">
                        <Link
                            href={route('admin.users.edit', user.id)}
                            title="Editar utilizador"
                            aria-label="Editar utilizador"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                        >
                            <Pencil size={16} strokeWidth={1.9} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => pedirAlternarAtivo(user)}
                            disabled={processingId === user.id || impedirDesativar}
                            title={
                                impedirDesativar
                                    ? 'Não pode desativar a sua própria conta'
                                    : user.ativo
                                        ? 'Desativar utilizador'
                                        : 'Ativar utilizador'
                            }
                            aria-label={
                                impedirDesativar
                                    ? 'Não pode desativar a sua própria conta'
                                    : user.ativo
                                        ? 'Desativar utilizador'
                                        : 'Ativar utilizador'
                            }
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
                );
            },
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

                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-[1fr_200px_160px_auto]">
                    <div className="relative">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    pesquisarAgora();
                                }
                            }}
                            placeholder="Pesquisar por nome ou e-mail"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={limparPesquisa}
                                aria-label="Limpar pesquisa"
                                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X size={14} strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <select
                        value={roleId}
                        onChange={(event) => handleRoleChange(event.target.value)}
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
                        value={ativoFiltro}
                        onChange={(event) => handleAtivoChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        <option value="1">Ativos</option>
                        <option value="0">Inativos</option>
                    </select>

                    <button
                        type="button"
                        onClick={limparTudo}
                        className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700"
                    >
                        Limpar
                    </button>
                </div>

                <div className="p-6 pb-24">
                    <Table
                        columns={columns}
                        data={users.data}
                        loading={carregando}
                        stickyHeader
                        emptyMessage={
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="font-semibold text-slate-600 dark:text-slate-300">
                                    Nenhum utilizador encontrado
                                </p>

                                <p className="text-sm text-slate-400">
                                    Experimente alterar ou limpar os filtros.
                                </p>

                                <button
                                    type="button"
                                    onClick={limparTudo}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        }
                    />

                    <Pagination
                        pagination={users}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>

            <Modal show={!!confirmando} onClose={() => setConfirmando(null)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                            <AlertTriangle size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Desativar {confirmando?.name}?
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                O utilizador deixa de conseguir aceder à plataforma até a conta
                                ser reativada.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setConfirmando(null)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={() => confirmando && executarToggle(confirmando)}
                            disabled={processingId === confirmando?.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processingId === confirmando?.id ? 'A desativar...' : 'Desativar utilizador'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
