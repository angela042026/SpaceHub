import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const cookieBannerVisible = useCookieBannerVisible();

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);

        return () =>
            window.removeEventListener(
                'scroll',
                handleScroll,
            );
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
            className={`fixed left-6 z-[110] flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#03172B]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#14B8A6]/40 hover:bg-[#14B8A6] hover:text-[#03172B] hover:shadow-[#14B8A6]/30 active:scale-95 ${
                cookieBannerVisible
                    ? 'bottom-48 lg:bottom-28'
                    : 'bottom-8'
            } ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-6 opacity-0'
            }`}
        >
            <ChevronUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
    );
}
