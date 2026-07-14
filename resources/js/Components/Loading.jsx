import { Loader2 } from 'lucide-react';

export function Spinner({ size = 16, className = '' }) {
    return (
        <Loader2
            size={size}
            strokeWidth={2}
            className={`animate-spin ${className}`}
        />
    );
}

export function LoadingOverlay({ show, label = 'A carregar...' }) {
    if (!show) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-24 backdrop-blur-[1px] dark:bg-slate-950/60">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <Spinner size={16} className="text-teal-500" />
                {label}
            </div>
        </div>
    );
}

export function LoadingBadge({ show, label = 'A atualizar' }) {
    if (!show) {
        return null;
    }

    return (
        <span className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            <Spinner size={12} className="text-teal-500" />
            {label}
        </span>
    );
}
