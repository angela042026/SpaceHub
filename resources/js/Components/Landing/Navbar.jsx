import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    LogIn,
    Menu,
    X,
} from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function Navbar() {
    const { t } = useTranslation('landing');
    const { auth } = usePage().props;

    const navigation = [
        { label: t('nav.funcionalidades'), href: '#funcionalidades' },
        { label: t('nav.comoReservar'), href: '#como-funciona' },
        { label: t('nav.espacos'), href: '#espacos' },
        { label: t('nav.precos'), href: '#precos' },
        { label: t('nav.beneficios'), href: '#beneficios' },
        { label: t('nav.contacto'), href: '#contacto' },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleAnchorClick = (href) => {
        setIsMenuOpen(false);

        const section = document.querySelector(href);

        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'border-white/10 bg-[#03172B]/95 shadow-xl backdrop-blur-xl'
                    : 'border-transparent bg-[#03172B]/98 backdrop-blur-md'
            }`}
        >
            <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-3"
                    aria-label={t('nav.paginaInicial')}
                >
                    <img
                        src="/images/logo/logobranco.png"
                        alt="SpaceHub"
                        className="h-14 w-auto object-contain"
                    />
                </Link>

                <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
                    {navigation.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(event) => {
                                event.preventDefault();
                                handleAnchorClick(item.href);
                            }}
                            className="group relative py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-200 transition-colors duration-300 hover:text-[#14B8A6]"
                        >
                            {item.label}

                            <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#14B8A6] transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <LanguageSwitcher variant="dark" />

                    <Link
                        href={
                            auth?.user
                                ? route('dashboard')
                                : route('login')
                        }
                        className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#14B8A6]/80 px-6 text-sm font-bold text-[#032238] shadow-lg shadow-[#14B8A6]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#14B8A6] hover:shadow-[#14B8A6]/40"
                    >
                        <LogIn size={17} />

                        <span>
                            {auth?.user
                                ? t('nav.dashboard')
                                : t('nav.entrar')}
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setIsMenuOpen((value) => !value)
                    }
                    aria-label={t('nav.abrirMenu')}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-[#14B8A6]/50 hover:bg-white/10 hover:text-[#14B8A6] lg:hidden"
                >
                    {isMenuOpen ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>
            </div>

            {isMenuOpen && (
                <div className="border-t border-white/10 bg-[#03172B] px-5 pb-6 pt-4 lg:hidden">
                    <nav className="flex flex-col gap-1">
                        {navigation.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleAnchorClick(item.href);
                                }}
                                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-white/5 hover:text-[#14B8A6]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="mt-4">
                        <LanguageSwitcher variant="dark" compact />
                    </div>

                    <Link
                        href={
                            auth?.user
                                ? route('dashboard')
                                : route('login')
                        }
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14B8A6]/80 px-5 text-sm font-bold text-[#032238] shadow-lg shadow-[#14B8A6]/25 transition hover:bg-[#14B8A6]"
                    >
                        <LogIn size={17} />

                        {auth?.user
                            ? t('nav.dashboard')
                            : t('nav.entrar')}
                    </Link>
                </div>
            )}
        </header>
    );
}
