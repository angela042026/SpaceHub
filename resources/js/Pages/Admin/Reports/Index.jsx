import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    FileText,
    LifeBuoy,
    UserRound,
} from 'lucide-react';

const RELATORIOS = [
    {
        titulo: 'Relatório de Reservas',
        descricao: 'Lista de reservas filtrável por período e estado, pronta para imprimir.',
        icon: CalendarDays,
        route: 'admin.reports.reservas',
    },
    {
        titulo: 'Relatório de Utilizadores',
        descricao: 'Lista de contas do sistema, filtrável por papel e estado.',
        icon: UserRound,
        route: 'admin.reports.utilizadores',
    },
    {
        titulo: 'Relatório de Suporte',
        descricao: 'Pedidos de suporte filtráveis por estado.',
        icon: LifeBuoy,
        route: 'admin.reports.suporte',
    },
];

export default function Index() {
    return (
        <DashboardLayout>
            <Head title="Relatórios" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <FileText size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Relatórios
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Documentos imprimíveis com os dados da plataforma.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
                    {RELATORIOS.map((relatorio) => (
                        <Link
                            key={relatorio.route}
                            href={route(relatorio.route)}
                            className="group flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-lg dark:border-slate-800"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <relatorio.icon size={20} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">
                                    {relatorio.titulo}
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {relatorio.descricao}
                                </p>
                            </div>

                            <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition group-hover:gap-2.5 dark:text-teal-400">
                                Ver relatório
                                <ArrowRight size={15} strokeWidth={1.9} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </DashboardLayout>
    );
}
