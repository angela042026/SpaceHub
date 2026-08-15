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
 *
 * `numbered` (opt-in, false por omissão — as outras páginas que usam
 * este componente continuam exatamente iguais): troca o texto central
 * "Página X de Y" por botões numerados com "…" para intervalos longos
 * (ex.: ‹ 1 2 3 … 9 ›). Como o formato de API Resource só traz
 * first/last/prev/next (sem uma URL por número), navegar para um
 * número específico não usa router.get(url) como Anterior/Seguinte —
 * chama `onNavigate(numeroDaPagina)`, que a página que usa o
 * componente implementa com os seus próprios filtros/pesquisa atuais.
 */
export default function Pagination({
    pagination,
    disabled = false,
    onStart,
    onFinish,
    itemLabel = 'resultados',
    numbered = false,
    onNavigate,
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

    const irParaNumero = (numero) => {
        if (disabled || numero === meta.current_page) {
            return;
        }

        onNavigate?.(numero);
    };

    const numerosPagina = numbered ? gerarNumerosPagina(meta.current_page, meta.last_page) : null;

    return (
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-400 sm:text-left">
                A mostrar {meta.from ?? 0}–{meta.to ?? 0} de {meta.total ?? 0} {itemLabel}
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    aria-label="Página anterior"
                    disabled={disabled || !urlAnterior}
                    onClick={() => irParaPagina(urlAnterior)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    <ChevronLeft size={16} strokeWidth={1.9} />
                    {!numbered && 'Anterior'}
                </button>

                {numbered ? (
                    <div className="flex items-center gap-1">
                        {numerosPagina.map((item, indice) => (
                            item === '…' ? (
                                <span
                                    key={`ellipsis-${indice}`}
                                    className="px-1 text-xs font-semibold text-slate-400"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    disabled={disabled}
                                    aria-current={item === meta.current_page ? 'page' : undefined}
                                    onClick={() => irParaNumero(item)}
                                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                        item === meta.current_page
                                            ? 'bg-navy-900 text-white'
                                            : 'text-slate-500 hover:bg-teal-500/10 hover:text-teal-600 dark:text-slate-400'
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        ))}
                    </div>
                ) : (
                    <p className="whitespace-nowrap text-xs font-medium text-slate-500">
                        Página {meta.current_page} de {meta.last_page}
                    </p>
                )}

                <button
                    type="button"
                    aria-label="Página seguinte"
                    disabled={disabled || !urlSeguinte}
                    onClick={() => irParaPagina(urlSeguinte)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                >
                    {!numbered && 'Seguinte'}
                    <ChevronRight size={16} strokeWidth={1.9} />
                </button>
            </div>
        </div>
    );
}

/**
 * Sempre inclui a primeira, a última e uma janela em torno da página
 * atual — o resto vira "…". Ex.: atual=5, última=9 → [1, '…', 4, 5, 6,
 * '…' seria redundante aqui porque 6 já está a 3 de 9, então na
 * prática dá [1, '…', 4, 5, 6, 9] sem duplicar o "…" quando os
 * intervalos já são contíguos.
 */
function gerarNumerosPagina(atual, ultima) {
    const paginas = new Set([1, ultima, atual - 1, atual, atual + 1]);
    const ordenadas = Array.from(paginas)
        .filter((pagina) => pagina >= 1 && pagina <= ultima)
        .sort((a, b) => a - b);

    const resultado = [];
    let anterior = null;

    ordenadas.forEach((pagina) => {
        if (anterior !== null && pagina - anterior > 1) {
            resultado.push('…');
        }

        resultado.push(pagina);
        anterior = pagina;
    });

    return resultado;
}
