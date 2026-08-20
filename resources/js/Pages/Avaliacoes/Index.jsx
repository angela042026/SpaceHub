import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, Hash, Star } from 'lucide-react';
import { ESTADO_AVALIACAO, badge, etiqueta } from '@/utils/estados';

const badgeEstadoAvaliacao = (estado) =>
    estado === 'pendente'
        ? 'bg-amber-50 text-orange-600 dark:bg-amber-500/10 dark:text-amber-400'
        : badge(ESTADO_AVALIACAO, estado);

export default function Index({ avaliacoes }) {
    const { t, i18n } = useTranslation('avaliacoes');
    const { t: tc } = useTranslation('common');

    const rotuloEstadoAvaliacao = (estado) =>
        estado === 'pendente' ? t('aAguardarModeracao') : etiqueta(ESTADO_AVALIACAO, estado, estado, tc);

    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title={t('tituloPagina')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                        <Star size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('descricao', { count: avaliacoes.meta.total })}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {avaliacoes.data.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-sm text-slate-400">
                                {t('semAvaliacoes')}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {avaliacoes.data.map((avaliacao) => (
                                <div
                                    key={avaliacao.id}
                                    className="flex flex-row items-center justify-between gap-4 rounded-[18px] border border-slate-200 border-l-[3px] border-l-teal-400 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md dark:border-slate-800 dark:border-l-teal-500 dark:bg-slate-900 sm:p-5"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex gap-0.5 text-amber-400">
                                            {Array.from({ length: 5 }).map((_, indice) => (
                                                <Star
                                                    key={indice}
                                                    size={18}
                                                    fill={indice < avaliacao.nota ? 'currentColor' : 'none'}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </div>

                                        <p className="mt-3 break-words text-base font-bold text-slate-900 dark:text-white">
                                            {avaliacao.comentario}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Hash size={13} strokeWidth={1.9} />
                                                {avaliacao.reserva?.secretaria ?? '-'}
                                            </span>

                                            <span className="text-slate-300 dark:text-slate-700">•</span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <Building2 size={13} strokeWidth={1.9} />
                                                {avaliacao.reserva?.setor ?? '-'}
                                            </span>

                                            <span className="text-slate-300 dark:text-slate-700">•</span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays size={13} strokeWidth={1.9} />
                                                {new Date(avaliacao.reserva?.data ?? avaliacao.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'pt-PT')}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex shrink-0 items-center self-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${badgeEstadoAvaliacao(
                                            avaliacao.estado,
                                        )}`}
                                    >
                                        {rotuloEstadoAvaliacao(avaliacao.estado)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {avaliacoes.meta.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                {t('pagina', { atual: avaliacoes.meta.current_page, total: avaliacoes.meta.last_page })}
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
