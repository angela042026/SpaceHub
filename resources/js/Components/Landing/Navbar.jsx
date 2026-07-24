import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Globe2,
    LogIn,
    Menu,
    X,
} from 'lucide-react';

const navigation = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como reservar', href: '#como-funciona' },
    { label: 'Espaços', href: '#espacos' },
    { label: 'Preços', href: '#precos' },
    { label: 'Benefícios', href: '#beneficios' },
    { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
    const { auth } = usePage().props;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
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
                    aria-label="Página inicial SpaceHub"
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
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setIsLanguageOpen(
                                    (value) => !value,
                                )
                            }
                            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-[#14B8A6]/50 hover:bg-white/10"
                        >
                            <Globe2 size={17} />

                            <span>PT</span>

                            <ChevronDown
                                size={15}
                                className={`transition-transform ${
                                    isLanguageOpen
                                        ? 'rotate-180'
                                        : ''
                                }`}
                            />
                        </button>

                        {isLanguageOpen && (
                            <div className="absolute right-0 top-14 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-2xl">
                                <button
                                    type="button"
                                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-[#14B8A6]/10 hover:text-[#0F766E]"
                                >
                                    Português
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-[#14B8A6]/10 hover:text-[#0F766E]"
                                >
                                    English
                                </button>
                            </div>
                        )}
                    </div>

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
                                ? 'Dashboard'
                                : 'Entrar'}
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setIsMenuOpen((value) => !value)
                    }
                    aria-label="Abrir menu"
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
                        <button
                            type="button"
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:border-[#14B8A6]/50 hover:text-[#14B8A6]"
                        >
                            <Globe2 size={18} />
                            PT
                        </button>
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
                            ? 'Dashboard'
                            : 'Entrar'}
                    </Link>
                </div>
            )}
        </header>
    );
}
