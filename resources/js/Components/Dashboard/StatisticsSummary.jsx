import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    MapPinned,
    Trophy,
    UserRound,
} from 'lucide-react';

function Linha({ icon: Icon, label, valor }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <span className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Icon size={16} strokeWidth={1.9} className="text-teal-500" />
                {label}
            </span>

            <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {valor}
            </span>
        </div>
    );
}

export default function StatisticsSummary({ estatisticas }) {
    const secretariaTop = estatisticas?.secretariasMaisUtilizadas?.[0];
    const utilizadorTop = estatisticas?.utilizadoresComMaisReservas?.[0];

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <BarChart3 size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Estatísticas
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Resumo do período atual.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2.5 p-5">
                <Linha
                    icon={Trophy}
                    label="Piso em destaque"
                    valor={estatisticas?.pisoMaisUtilizado?.nome ?? 'Sem dados'}
                />

                <Linha
                    icon={MapPinned}
                    label="Setor em destaque"
                    valor={estatisticas?.setorMaisUtilizado?.nome ?? 'Sem dados'}
                />

                <Linha
                    icon={UserRound}
                    label="Utilizador mais ativo"
                    valor={utilizadorTop?.user?.name ?? 'Sem dados'}
                />

                <Linha
                    icon={BarChart3}
                    label="Secretária mais reservada"
                    valor={secretariaTop?.secretaria?.codigo ?? 'Sem dados'}
                />

                <Link
                    href={route('admin.statistics.index')}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                >
                    Ver estatísticas completas
                    <ArrowRight size={15} strokeWidth={1.9} />
                </Link>
            </div>
        </section>
    );
}
