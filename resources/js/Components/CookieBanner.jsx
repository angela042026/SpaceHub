import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { loadAnalytics } from '@/Lib/analytics';
import {
    COOKIE_BANNER_VISIBILITY_EVENT,
    COOKIE_CONSENT_KEY,
} from '@/Lib/cookieConsent';

function notifyVisibility(isVisible) {
    window.dispatchEvent(
        new CustomEvent(COOKIE_BANNER_VISIBILITY_EVENT, {
            detail: { visible: isVisible },
        }),
    );
}

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

        if (consent === 'accepted') {
            loadAnalytics();
        } else if (!consent) {
            setVisible(true);
            notifyVisibility(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');

        loadAnalytics();

        setVisible(false);
        notifyVisibility(false);
    };

    const rejectCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');

        setVisible(false);
        notifyVisibility(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100]">
            <div className="border-t border-white/10 bg-[#03172B]/95 shadow-2xl backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-4 px-5 py-4 text-center sm:px-8 lg:flex-row lg:justify-center lg:gap-8 lg:px-10 lg:text-left">
                    <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#14B8A6]/25 bg-[#14B8A6]/10 text-[#5EEAD4]">
                            <Cookie size={19} strokeWidth={1.9} />
                        </div>

                        <div className="max-w-xl">
                            <h2 className="text-sm font-semibold text-[#5EEAD4]">
                                Utilizamos cookies
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-slate-200">
                                Cookies essenciais garantem o funcionamento
                                da SpaceHub. Com o seu consentimento,
                                ativamos também cookies de análise.
                                <a
                                    href={route('legal.cookies')}
                                    className="ml-2 whitespace-nowrap font-semibold text-[#5EEAD4] underline-offset-4 transition hover:underline"
                                >
                                    Política de Cookies
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={rejectCookies}
                            className="h-11 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                            Só essenciais
                        </button>

                        <button
                            type="button"
                            onClick={acceptCookies}
                            className="h-11 rounded-xl bg-[#14B8A6]/80 px-5 text-sm font-semibold text-[#03172B] shadow-lg shadow-[#14B8A6]/20 transition hover:bg-[#14B8A6]"
                        >
                            Aceitar todos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
