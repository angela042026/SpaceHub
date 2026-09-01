import { usePage } from '@inertiajs/react';

export default function PrintFooter({ geradoEm }) {
    const { auth } = usePage().props;

    return (
        <div className="hidden print-footer print:mt-5 print:block print:h-auto print:min-h-0 print:break-before-avoid print:overflow-visible print:border-t print:border-slate-300 print:pt-2 print:text-center print:text-[9px] print:leading-snug print:text-slate-400">
            SpaceHub — Documento gerado automaticamente em {geradoEm} por {auth.user?.name ?? '-'}
        </div>
    );
}
