import { ArrowDownAZ, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

function iniciais(nome) {
    const partes = String(nome ?? '').trim().split(' ').filter(Boolean);

    if (partes.length === 0) {
        return '?';
    }

    if (partes.length === 1) {
        return partes[0].charAt(0).toUpperCase();
    }

    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_CORES = [
    'bg-teal-500/10 text-teal-600',
    'bg-blue-500/10 text-blue-600',
    'bg-indigo-500/10 text-indigo-600',
    'bg-amber-500/10 text-amber-600',
    'bg-rose-500/10 text-rose-600',
];

/**
 * Card compacto "Top Utilizadores" — top 5, avatar por iniciais, sem
 * repetir o padrão de vários cards enormes individuais.
 */
export default function TopUsersCard({ data = [] }) {
    const [ordem, setOrdem] = useState('reservas');

    const utilizadores = useMemo(() => {
        if (ordem === 'nome') {
            return [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
        }

        return data;
    }, [data, ordem]);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <Trophy size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Top Utilizadores
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Os 5 com mais reservas no período
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOrdem((atual) => (atual === 'reservas' ? 'nome' : 'reservas'))}
                    title={ordem === 'reservas' ? 'Ordenar por nome' : 'Ordenar por reservas'}
                    aria-label={ordem === 'reservas' ? 'Ordenar por nome' : 'Ordenar por reservas'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-teal-300 hover:text-teal-600 dark:border-slate-700"
                >
                    <ArrowDownAZ size={15} strokeWidth={1.9} />
                </button>
            </header>

            <div className="flex flex-1 flex-col justify-center p-3">
                {utilizadores.length > 0 ? (
                    <div className="space-y-0.5">
                        {utilizadores.map((utilizador, indice) => (
                            <div
                                key={utilizador.id}
                                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                                <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-slate-400">
                                    {indice + 1}
                                </span>

                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_CORES[indice % AVATAR_CORES.length]}`}
                                >
                                    {iniciais(utilizador.nome)}
                                </div>

                                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {utilizador.nome}
                                </p>

                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {utilizador.total}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[150px] flex-1 flex-col items-center justify-center gap-2 text-center">
                        <Users size={22} strokeWidth={1.8} className="text-slate-300" />
                        <p className="text-sm text-slate-400">Sem reservas neste período.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
