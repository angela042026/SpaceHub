import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle,
} from 'lucide-react';

const VARIANTS = {
    success: {
        icon: CheckCircle2,
        className:
            'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400',
        iconClassName: 'text-teal-500',
    },
    error: {
        icon: XCircle,
        className:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400',
        iconClassName: 'text-red-500',
    },
    warning: {
        icon: AlertTriangle,
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
        iconClassName: 'text-amber-500',
    },
    info: {
        icon: Info,
        className:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
        iconClassName: 'text-slate-500',
    },
};

export default function Alert({
    variant = 'info',
    title,
    children,
    onDismiss,
}) {
    const { icon: Icon, className, iconClassName } = VARIANTS[variant] ?? VARIANTS.info;

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border p-4 ${className}`}
        >
            <Icon size={20} strokeWidth={1.9} className={`mt-0.5 shrink-0 ${iconClassName}`} />

            <div className="min-w-0 flex-1">
                {title && (
                    <p className="text-sm font-bold">{title}</p>
                )}

                {children && (
                    <p className={`text-sm ${title ? 'mt-1' : ''}`}>{children}</p>
                )}
            </div>

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Fechar alerta"
                    className="shrink-0 opacity-70 transition hover:opacity-100"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
