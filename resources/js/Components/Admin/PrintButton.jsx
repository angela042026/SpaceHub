import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <div className="mb-5 flex justify-end print:hidden">
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white px-4 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-500 hover:text-white dark:border-teal-400 dark:bg-slate-900 dark:text-teal-400"
            >
                <Printer size={18} strokeWidth={1.9} />
                Imprimir
            </button>
        </div>
    );
}
