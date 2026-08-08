import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Armchair,
    Building2,
    Layers3,
    Trophy,
    UserRound,
} from 'lucide-react';

function Linha({ icon: Icon, label, valor, complemento }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <span className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                    <Icon size={15} strokeWidth={1.9} />
                </span>

                {label}
            </span>

            <span className="flex items-baseline gap-1.5 truncate">
                <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {valor}
                </span>

                {complemento && (
                    <span className="shrink-0 text-xs font-semibold text-slate-400">
                        · {complemento}
                    </span>
                )}
            </span>
        </div>
    );
}

export default function StatisticsSummary({ estatisticas }) {
    const pisoTop = estatisticas?.pisoMaisUtilizado;
    const setorTop = estatisticas?.setorMaisUtilizado;
    const utilizadorTop = estatisticas?.utilizadoresComMaisReservas?.[0];
    const secretariaTop = estatisticas?.secretariasMaisUtilizadas?.[0];

    // Base para a percentagem do piso em destaque: soma de todas as
    // reservas por piso no mesmo período (não vem pronta do backend).
    const totalReservasPorPiso = (
        estatisticas?.pisosPorUtilizacao ?? []
    ).reduce(
        (soma, piso) => soma + Number(piso.total ?? 0),
        0,
    );

    const percentualPiso =
        pisoTop && totalReservasPorPiso > 0
            ? Math.round(
                  (Number(pisoTop.total ?? 0) /
                      totalReservasPorPiso) *
                      100,
              )
            : null;

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Trophy size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Destaques do período
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Últimos 30 dias
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="space-y-2.5">
                    <Linha
                        icon={Building2}
                        label="Piso com mais reservas"
                        valor={pisoTop?.nome ?? 'Sem dados'}
                        complemento={
                            percentualPiso !== null
                                ? `${percentualPiso}%`
                                : null
                        }
                    />

                    <Linha
                        icon={Layers3}
                        label="Setor mais procurado"
                        valor={setorTop?.nome ?? 'Sem dados'}
                        complemento={
                            setorTop?.total
                                ? `${setorTop.total}`
                                : null
                        }
                    />

                    <Linha
                        icon={UserRound}
                        label="Utilizador com mais reservas"
                        valor={utilizadorTop?.user?.name ?? 'Sem dados'}
                        complemento={
                            utilizadorTop?.total
                                ? `${utilizadorTop.total}`
                                : null
                        }
                    />

                    <Linha
                        icon={Armchair}
                        label="Secretária mais reservada"
                        valor={secretariaTop?.secretaria?.codigo ?? 'Sem dados'}
                        complemento={
                            secretariaTop?.total
                                ? `${secretariaTop.total}`
                                : null
                        }
                    />
                </div>

                <Link
                    href={route('admin.statistics.index')}
                    className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-500 hover:text-white dark:border-teal-400 dark:bg-slate-900 dark:text-teal-400"
                >
                    Ver estatísticas completas
                    <ArrowRight size={15} strokeWidth={1.9} />
                </Link>
            </div>
        </section>
    );
}
