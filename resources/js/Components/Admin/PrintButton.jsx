import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <div className="mb-5 flex justify-end print:hidden">
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white px-4 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 hover:text-teal-700 dark:border-[#36566f] dark:bg-transparent dark:text-[#d7e3ed] dark:hover:border-[#18c3b3] dark:hover:bg-none dark:hover:bg-[#18c3b3]/[0.06] dark:hover:text-[#18c3b3]"
            >
                <Printer size={18} strokeWidth={1.9} />
                Imprimir
            </button>
        </div>
    );
}
