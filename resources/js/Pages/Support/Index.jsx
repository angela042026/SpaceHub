import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link } from '@inertiajs/react';
import { Eye, LifeBuoy } from 'lucide-react';
import { ESTADO_SUPORTE, badge } from '@/utils/estados';

export default function Index({ pedidos }) {

    const columns = [
        {
            key: 'data',
            label: 'Data',
            render: (pedido) => new Date(pedido.created_at).toLocaleDateString('pt-PT'),
        },
        {
            key: 'utilizador',
            label: 'Utilizador',
            render: (pedido) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {pedido.user.name}
                    </p>

                    <p className="text-xs text-slate-400">
                        {pedido.user.email}
                    </p>
                </div>
            ),
        },
        {
            key: 'assunto',
            label: 'Assunto',
            render: (pedido) => pedido.assunto,
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (pedido) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        badge(ESTADO_SUPORTE, pedido.estado)
                    }`}
                >
                    {pedido.estado}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (pedido) => (
                <div className="flex justify-end">
                    <Link
                        href={route('support.show', pedido.id)}
                        title="Ver"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Eye size={16} strokeWidth={1.9} />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Pedidos de Suporte" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <LifeBuoy size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Pedidos de Suporte
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {pedidos.length} pedido{pedidos.length === 1 ? '' : 's'} registado{pedidos.length === 1 ? '' : 's'}.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={pedidos}
                        emptyMessage="Ainda não existem pedidos de suporte."
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
