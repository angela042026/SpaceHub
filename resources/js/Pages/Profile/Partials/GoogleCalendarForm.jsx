import { Link } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GoogleCalendarIcon from '@/Components/GoogleCalendarIcon';

export default function GoogleCalendarForm({ conectado }) {
    const { t } = useTranslation('profile');

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <GoogleCalendarIcon size={34} />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Google Calendar
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('googleCalendar.subtitulo')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    {conectado ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            {t('googleCalendar.ligado')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {t('googleCalendar.naoLigado')}
                        </span>
                    )}

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {conectado
                            ? t('googleCalendar.descricaoLigado')
                            : t('googleCalendar.descricaoNaoLigado')}
                    </p>
                </div>

                {conectado ? (
                    <Link
                        href={route('google-calendar.desconectar')}
                        method="delete"
                        as="button"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
                    >
                        {t('googleCalendar.desligar')}
                    </Link>
                ) : (
                    // Navegação normal de página (não <Link> do Inertia):
                    // esta rota acaba por redirecionar para
                    // accounts.google.com, e um pedido XHR/Inertia para
                    // um domínio externo é bloqueado por CORS.
                    <a
                        href={route('google-calendar.redirect')}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <CalendarPlus size={18} strokeWidth={2} />
                        {t('googleCalendar.conectar')}
                    </a>
                )}
            </div>
        </section>
    );
}
