import { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { loadAnalytics } from '@/Lib/analytics';
import { COOKIE_CONSENT_KEY } from '@/Lib/cookieConsent';

export default function CookiePreferencesModal({ onClose }) {
    const [analyticsEnabled, setAnalyticsEnabled] = useState(
        () => localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted',
    );

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [onClose]);

    function guardar(valor) {
        localStorage.setItem(COOKIE_CONSENT_KEY, valor);

        if (valor === 'accepted') {
            loadAnalytics();
        }

        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#03172B]/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-preferences-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-[500px] animate-modal-in rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(3,23,43,0.25)] motion-reduce:animate-none sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2
                        id="cookie-preferences-title"
                        className="text-lg font-bold text-[#071A33]"
                    >
                        Preferências de cookies
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Escolha que cookies podemos usar. Pode alterar esta
                    decisão sempre que quiser através deste botão.
                </p>

                <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-[#071A33]">
                                Cookies essenciais
                            </p>
                            <p className="text-xs text-slate-500">
                                Sempre ativos, necessários para o
                                funcionamento da SpaceHub.
                            </p>
                        </div>

                        <span
                            aria-hidden="true"
                            className="relative h-5 w-9 shrink-0 rounded-full bg-[#14B8A6]"
                        >
                            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                                <Lock
                                    size={9}
                                    strokeWidth={2.5}
                                    className="text-[#14B8A6]"
                                />
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-[#071A33]">
                                Cookies de análise
                            </p>
                            <p className="text-xs text-slate-500">
                                Ajudam-nos a perceber como a plataforma é
                                utilizada.
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={analyticsEnabled}
                            aria-label="Ativar cookies de análise"
                            onClick={() =>
                                setAnalyticsEnabled(
                                    (atual) => !atual,
                                )
                            }
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 ${
                                analyticsEnabled
                                    ? 'bg-[#14B8A6]'
                                    : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    analyticsEnabled
                                        ? 'translate-x-[18px]'
                                        : 'translate-x-0.5'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <a
                    href={route('legal.cookies')}
                    className="mt-4 inline-block text-xs font-semibold text-[#0F766E] underline-offset-4 hover:underline"
                >
                    Consultar a Política de Cookies
                </a>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                    <button
                        type="button"
                        onClick={() => guardar('rejected')}
                        className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#071A33] transition hover:bg-slate-50"
                    >
                        Só essenciais
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            guardar(
                                analyticsEnabled
                                    ? 'accepted'
                                    : 'rejected',
                            )
                        }
                        className="h-11 flex-1 rounded-xl border border-[#14B8A6]/40 bg-[#EAFBF8] px-4 text-sm font-semibold text-[#0F766E] transition hover:bg-[#14B8A6]/15"
                    >
                        Guardar preferências
                    </button>

                    <button
                        type="button"
                        onClick={() => guardar('accepted')}
                        className="h-11 flex-1 rounded-xl bg-[#14B8A6] px-4 text-sm font-bold text-[#03172B] shadow-lg shadow-[#14B8A6]/25 transition hover:bg-[#0d9488]"
                    >
                        Aceitar todos
                    </button>
                </div>
            </div>
        </div>
    );
}
