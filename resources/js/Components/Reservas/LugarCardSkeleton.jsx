/**
 * Estado de carregamento de um LugarCard, com as mesmas proporções do
 * cartão real (imagem, badges, título, botões de período e botão de
 * reservar), para a grelha não "saltar" quando os dados chegam.
 */
export default function LugarCardSkeleton() {
    return (
        <div
            className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-hidden="true"
        >
            <div className="h-40 w-full bg-slate-200 dark:bg-slate-800" />

            <div className="p-4">
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-3.5 w-32 rounded bg-slate-100 dark:bg-slate-800/70" />

                <div className="mt-3 flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800/70" />
                    <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800/70" />
                    <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800/70" />
                </div>

                <div className="mt-4 flex gap-2">
                    <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                    <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                    <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                </div>

                <div className="mt-3 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800/70" />
            </div>
        </div>
    );
}
