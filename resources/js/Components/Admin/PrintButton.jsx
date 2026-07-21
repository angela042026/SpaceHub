import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <div className="mb-5 flex justify-end print:hidden">
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-navy-950 hover:shadow-lg"
            >
                <Printer size={18} strokeWidth={1.9} />
                Imprimir
            </button>
        </div>
    );
}
