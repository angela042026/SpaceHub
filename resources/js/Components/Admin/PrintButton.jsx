import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PrintButton() {
    const { t } = useTranslation('relatorios');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('imprimir') !== '1') {
            return undefined;
        }

        const timeout = window.setTimeout(() => window.print(), 300);

        return () => window.clearTimeout(timeout);
    }, []);

    const imprimirRelatorioCompleto = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('imprimir', '1');
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="mb-5 flex justify-end print:hidden">
            <button
                type="button"
                onClick={imprimirRelatorioCompleto}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white px-4 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 hover:text-teal-700 dark:border-[#36566f] dark:bg-transparent dark:text-[#d7e3ed] dark:hover:border-[#18c3b3] dark:hover:bg-none dark:hover:bg-[#18c3b3]/[0.06] dark:hover:text-[#18c3b3]"
            >
                <Printer size={18} strokeWidth={1.9} />
                {t('impressao.imprimir')}
            </button>
        </div>
    );
}
