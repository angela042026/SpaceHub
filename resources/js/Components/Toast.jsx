import { usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';

const VARIANTS = {
    success: {
        icon: CheckCircle2,
        className:
            'border-teal-200 bg-white text-teal-700 dark:border-teal-500/30 dark:bg-card dark:text-teal-400',
        iconClassName: 'text-teal-500',
    },
    error: {
        icon: XCircle,
        className:
            'border-red-200 bg-white text-red-700 dark:border-red-500/30 dark:bg-card dark:text-red-400',
        iconClassName: 'text-red-500',
    },
};

function ToastMessage({ type, message, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);

        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    const { icon: Icon, className, iconClassName } = VARIANTS[type];

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${className}`}
        >
            <Icon size={20} className={`mt-0.5 shrink-0 ${iconClassName}`} />

            <p className="text-sm font-medium">{message}</p>

            <button
                type="button"
                onClick={onDismiss}
                className="ml-2 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default function Toast() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState({ success: false, error: false });
    const cookieBannerVisible = useCookieBannerVisible();

    useEffect(() => {
        setDismissed({ success: false, error: false });
    }, [flash?.success, flash?.error]);

    const messages = [
        flash?.success && !dismissed.success
            ? { type: 'success', message: flash.success }
            : null,
        flash?.error && !dismissed.error
            ? { type: 'error', message: flash.error }
            : null,
    ].filter(Boolean);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div
            className={`pointer-events-none fixed inset-x-4 z-50 flex flex-col items-end gap-3 transition-all duration-300 sm:inset-x-auto sm:right-6 ${
                cookieBannerVisible ? 'bottom-72 lg:bottom-48' : 'bottom-24'
            }`}
        >
            {messages.map(({ type, message }) => (
                <div key={type} className="pointer-events-auto w-full sm:w-96">
                    <ToastMessage
                        type={type}
                        message={message}
                        onDismiss={() => setDismissed((prev) => ({ ...prev, [type]: true }))}
                    />
                </div>
            ))}
        </div>
    );
}
