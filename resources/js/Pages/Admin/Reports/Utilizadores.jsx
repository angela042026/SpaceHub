import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { UserRound } from 'lucide-react';

export default function Utilizadores({ utilizadores, roles, filters, geradoEm }) {
    const { data, setData, get } = useForm({
        role_id: filters.role_id ?? '',
        ativo: filters.ativo ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.utilizadores'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'name',
            label: 'Nome',
        },
        {
            key: 'email',
            label: 'E-mail',
        },
        {
            key: 'role',
            label: 'Papel',
            render: (user) => user.role?.nome ?? '-',
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (user) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold print:rounded-none print:px-0 print:py-0 print:text-slate-700 ${
                        user.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Criado em',
            render: (user) => new Date(user.created_at).toLocaleDateString('pt-PT'),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Relatório de Utilizadores" />

            <PrintHeader
                title="Relatório de Utilizadores"
                subtitle={`${utilizadores.total} utilizador${utilizadores.total === 1 ? '' : 'es'} listado${utilizadores.total === 1 ? '' : 's'}`}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 print:hidden dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <UserRound size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Relatório de Utilizadores
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {utilizadores.total} utilizador{utilizadores.total === 1 ? '' : 'es'} encontrado{utilizadores.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <div className="-mb-5">
                        <PrintButton />
                    </div>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-[200px_160px_auto]"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Papel</label>
                        <select
                            value={data.role_id}
                            onChange={(event) => setData('role_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">Todos os papéis</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
                        <select
                            value={data.ativo}
                            onChange={(event) => setData('ativo', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">Todos os estados</option>
                            <option value="1">Ativos</option>
                            <option value="0">Inativos</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950 sm:w-auto"
                        >
                            Filtrar
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={utilizadores.data}
                        emptyMessage="Nenhum utilizador encontrado para os filtros selecionados."
                    />

                    <Pagination pagination={utilizadores} itemLabel="utilizadores" />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
