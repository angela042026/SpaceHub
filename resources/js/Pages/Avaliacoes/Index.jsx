import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ESTADO_AVALIACAO, badge, etiqueta } from '@/utils/estados';

export default function Index({ avaliacoes }) {
    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title="Minhas Avaliações" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                        <Star size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            As Minhas Avaliações
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {avaliacoes.meta.total} avaliaç{avaliacoes.meta.total === 1 ? 'ão' : 'ões'} enviada{avaliacoes.meta.total === 1 ? '' : 's'}.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {avaliacoes.data.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-sm text-slate-400">
                                Ainda não enviaste nenhuma avaliação.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {avaliacoes.data.map((avaliacao) => (
                                <div
                                    key={avaliacao.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex gap-0.5 text-amber-400">
                                            {Array.from({ length: 5 }).map((_, indice) => (
                                                <Star
                                                    key={indice}
                                                    size={15}
                                                    fill={indice < avaliacao.nota ? 'currentColor' : 'none'}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                                badge(ESTADO_AVALIACAO, avaliacao.estado)
                                            }`}
                                        >
                                            {etiqueta(ESTADO_AVALIACAO, avaliacao.estado)}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                        {avaliacao.comentario}
                                    </p>

                                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                                            {avaliacao.reserva?.secretaria ?? '-'}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            {avaliacao.reserva?.setor ?? '-'} · {new Date(avaliacao.reserva?.data ?? avaliacao.created_at).toLocaleDateString('pt-PT')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {avaliacoes.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {avaliacoes.meta.current_page} de {avaliacoes.meta.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!avaliacoes.links.prev}
                                    onClick={() => irParaPagina(avaliacoes.links.prev)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!avaliacoes.links.next}
                                    onClick={() => irParaPagina(avaliacoes.links.next)}
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
