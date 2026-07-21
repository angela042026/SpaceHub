import { usePage } from '@inertiajs/react';

export default function PrintFooter({ geradoEm }) {
    const { auth } = usePage().props;

    return (
        <div className="hidden print:mt-8 print:block print:border-t print:border-slate-300 print:pt-3 print:text-center print:text-[10px] print:text-slate-400">
            SpaceHub — Documento gerado automaticamente em {geradoEm} por {auth.user?.name ?? '-'}
        </div>
    );
}
