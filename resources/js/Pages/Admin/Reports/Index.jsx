import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Armchair,
    ArrowRight,
    CalendarDays,
    CircleX,
    FileText,
    LifeBuoy,
    TrendingUp,
    UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RELATORIOS = [
    { chave: 'reservas', icon: CalendarDays, route: 'admin.reports.reservas' },
    { chave: 'utilizadores', icon: UserRound, route: 'admin.reports.utilizadores' },
    { chave: 'suporte', icon: LifeBuoy, route: 'admin.reports.suporte' },
    { chave: 'ocupacao', icon: TrendingUp, route: 'admin.reports.ocupacao' },
    { chave: 'espacos', icon: Armchair, route: 'admin.reports.espacos' },
    { chave: 'cancelamentos', icon: CircleX, route: 'admin.reports.cancelamentos' },
];

export default function Index() {
    const { t } = useTranslation('relatorios');

    return (
        <DashboardLayout>
            <Head title={t('index.titulo')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <FileText size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('index.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('index.descricao')}
                        </p>
                    </div>
                </div>

                {/*
                    3x2 no desktop, 2 colunas no tablet, 1 no telemóvel —
                    items-stretch (por omissão do grid) garante que os 6
                    cards da mesma linha ficam com a mesma altura; cada
                    card usa h-full + flex-col + "Ver relatório" com
                    mt-auto para esse texto ficar sempre encostado à
                    base, mesmo quando a descrição tem mais linhas do
                    que a do vizinho.
                */}
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {RELATORIOS.map((relatorio) => (
                        <Link
                            key={relatorio.route}
                            href={route(relatorio.route)}
                            className="group flex h-full min-h-[290px] flex-col gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-lg dark:border-slate-800"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <relatorio.icon size={20} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">
                                    {t(`index.cards.${relatorio.chave}.titulo`)}
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {t(`index.cards.${relatorio.chave}.descricao`)}
                                </p>
                            </div>

                            <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition group-hover:gap-2.5 dark:text-teal-400">
                                {t('index.verRelatorio')}
                                <ArrowRight size={15} strokeWidth={1.9} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </DashboardLayout>
    );
}
