import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';
import { COOKIE_CONSENT_KEY } from '@/Lib/cookieConsent';
import CookiePreferencesModal from './CookiePreferencesModal';

// Só aparece depois de existir uma escolha guardada (a faixa de
// cookies já foi fechada) — nunca ao mesmo tempo que a faixa.
export default function CookiePreferencesButton() {
    const { t } = useTranslation('landing');
    const bannerVisible = useCookieBannerVisible();
    const [hasConsent, setHasConsent] = useState(() =>
        Boolean(localStorage.getItem(COOKIE_CONSENT_KEY)),
    );
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!bannerVisible) {
            setHasConsent(
                Boolean(
                    localStorage.getItem(COOKIE_CONSENT_KEY),
                ),
            );
        }
    }, [bannerVisible]);

    if (bannerVisible || !hasConsent) {
        return null;
    }

    return (
        <>
            <div className="group relative">
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    aria-label={t('cookies.gerirPreferencias')}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#14B8A6]/30 bg-[#03172B] text-[#5EEAD4] shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6]/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                    <Cookie size={20} strokeWidth={1.9} />
                </button>

                <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#03172B] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                    {t('cookies.gerirCookies')}
                </span>
            </div>

            {modalOpen && (
                <CookiePreferencesModal
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}
