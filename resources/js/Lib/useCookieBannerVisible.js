import { useEffect, useState } from 'react';
import {
    COOKIE_BANNER_VISIBILITY_EVENT,
    COOKIE_CONSENT_KEY,
} from '@/Lib/cookieConsent';

export default function useCookieBannerVisible() {
    const [visible, setVisible] = useState(
        () => !localStorage.getItem(COOKIE_CONSENT_KEY),
    );

    useEffect(() => {
        const handleBannerVisibility = (event) => {
            setVisible(event.detail.visible);
        };

        window.addEventListener(
            COOKIE_BANNER_VISIBILITY_EVENT,
            handleBannerVisibility,
        );

        return () =>
            window.removeEventListener(
                COOKIE_BANNER_VISIBILITY_EVENT,
                handleBannerVisibility,
            );
    }, []);

    return visible;
}
