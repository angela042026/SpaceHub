import ScrollToTopButton from './ScrollToTopButton';
import CookiePreferencesButton from './CookiePreferencesButton';
import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';

// Agrupa a seta "Voltar ao topo" e o botão de cookies numa única
// coluna flutuante no canto inferior esquerdo — a seta fica sempre
// por cima do botão de cookies, nunca se sobrepõem.
export default function LeftFloatingActions() {
    const cookieBannerVisible = useCookieBannerVisible();

    return (
        <div
            className={`fixed left-4 z-[110] flex flex-col items-center gap-3 transition-[bottom] duration-300 sm:left-6 ${
                cookieBannerVisible
                    ? 'bottom-48 lg:bottom-28'
                    : 'bottom-4 sm:bottom-6'
            }`}
        >
            <ScrollToTopButton />
            <CookiePreferencesButton />
        </div>
    );
}
