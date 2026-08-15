import { ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

/**
 * Paginação partilhada pelas listagens administrativas — antes
 * reimplementada de forma idêntica em 7 páginas Admin/*\/Index.jsx.
 *
 * Aceita tanto o formato de API Resource paginado (`{ meta, links }`)
 * como o formato por omissão do Laravel (`current_page`, `last_page`,
 * `prev_page_url`, `next_page_url` diretamente no objeto) — usado pela
 * listagem de Reservas.
 *
 * `itemLabel` é opcional — sem ele, o texto usa "resultados" por omissão.
 */
export default function Pagination({
    pagination,
    disabled = false,
    onStart,
    onFinish,
    itemLabel = 'resultados',
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

        // Sem preserveScroll: true, o Inertia repõe o scroll no topo da
        // página depois da navegação — antes, o utilizador ficava parado
        // junto ao rodapé (onde clicou "Seguinte") sem ver as linhas
        // novas até subir manualmente.
        router.get(
            url,
            {},
            { preserveState: true, onStart, onFinish },
        );
    };

    return (
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-400 sm:text-left">
                A mostrar {meta.from ?? 0}–{meta.to ?? 0} de {meta.total ?? 0} {itemLabel}
            </p>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label="Página anterior"
                    disabled={disabled || !urlAnterior}
                    onClick={() => irParaPagina(urlAnterior)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    <ChevronLeft size={16} strokeWidth={1.9} />
                    Anterior
                </button>

                <p className="whitespace-nowrap text-xs font-medium text-slate-500">
                    Página {meta.current_page} de {meta.last_page}
                </p>

                <button
                    type="button"
                    aria-label="Página seguinte"
                    disabled={disabled || !urlSeguinte}
                    onClick={() => irParaPagina(urlSeguinte)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    Seguinte
                    <ChevronRight size={16} strokeWidth={1.9} />
                </button>
            </div>
        </div>
    );
}
