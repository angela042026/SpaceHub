import { ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

/**
 * Paginação partilhada pelas listagens administrativas — antes
 * reimplementada de forma idêntica em 7 páginas Admin/*\/Index.jsx.
 *
 * Aceita tanto o formato de API Resource paginado (`{ meta, links }`)
 * como o formato por omissão do Laravel (`current_page`, `last_page`,
 * `prev_page_url`, `next_page_url` diretamente no objeto) — usado
 * pela listagem de Reservas.
 */
export default function Pagination({
    pagination,
    disabled = false,
    onStart,
    onFinish,
}) {
    if (!pagination) {
        return null;
    }

    const meta = pagination.meta ?? pagination;
    const urlAnterior = pagination.links?.prev ?? pagination.prev_page_url;
    const urlSeguinte = pagination.links?.next ?? pagination.next_page_url;

    if (!meta.last_page || meta.last_page <= 1) {
        return null;
    }

    const irParaPagina = (url) => {
        if (!url || disabled) {
            return;
        }

        router.get(
            url,
            {},
            { preserveState: true, preserveScroll: true, onStart, onFinish },
        );
    };

    return (
        <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-400">
                Página {meta.current_page} de {meta.last_page}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    aria-label="Página anterior"
                    disabled={disabled || !urlAnterior}
                    onClick={() => irParaPagina(urlAnterior)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    <ChevronLeft size={16} strokeWidth={1.9} />
                </button>

                <button
                    type="button"
                    aria-label="Página seguinte"
                    disabled={disabled || !urlSeguinte}
                    onClick={() => irParaPagina(urlSeguinte)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    <ChevronRight size={16} strokeWidth={1.9} />
                </button>
            </div>
        </div>
    );
}
