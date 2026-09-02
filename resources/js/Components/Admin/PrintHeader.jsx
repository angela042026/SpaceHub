import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function PrintHeader({ title, subtitle, geradoEm }) {
    const { auth } = usePage().props;
    const { t } = useTranslation('relatorios');

    return (
        <div className="hidden print-header print:mb-5 print:flex print:h-auto print:min-h-0 print:break-after-avoid print:items-start print:justify-between print:gap-6 print:overflow-visible print:border-b print:border-slate-300 print:pb-3">
            <div className="flex min-w-0 items-center gap-3">
                <img src="/images/logo/logo.png" alt="SpaceHub" className="h-9 w-auto shrink-0" />

                <div className="min-w-0">
                    <h1 className="text-lg font-bold leading-tight text-slate-900">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-1 text-xs leading-snug text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="shrink-0 text-right text-[10px] leading-snug text-slate-500">
                <p>{t('impressao.geradoEm', { data: geradoEm })}</p>
                <p>{t('impressao.por', { nome: auth.user?.name ?? '-' })}</p>
            </div>
        </div>
    );
}
