import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronDown,
    Globe2,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AuthHeader({
    theme,
    toggleTheme,
}) {
    const darkMode = theme === 'dark';

    return (
        <header
            className="
                relative z-30
                border-b border-slate-100
                bg-white/95 backdrop-blur
                dark:border-white/10
                dark:bg-[#06172A]/95
            "
        >
            <div className="mx-auto flex h-24 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
                <Link
                    href="/"
                    className="flex items-center"
                    aria-label="Voltar à página inicial"
                >
                    <img
                        src={
                            darkMode
                                ? '/images/logo/logoprincipalbranco.png'
                                : '/images/logo/logo.png'
                        }
                        alt="SpaceHub"
                        className="h-16 w-auto object-contain transition-all duration-300"
                    />
                </Link>

                <div className="flex items-center gap-3">
                    <ThemeToggle
                        theme={theme}
                        onToggle={toggleTheme}
                    />

                    <button
                        type="button"
                        aria-label="Selecionar idioma"
                        className="
                            hidden h-11 items-center gap-2
                            rounded-xl border border-slate-200
                            bg-white px-3
                            text-sm font-semibold
                            text-[#102E55]
                            shadow-sm transition
                            hover:border-[#14B8A6]
                            hover:text-[#0F9E90]
                            dark:border-white/15
                            dark:bg-white/5
                            dark:text-slate-200
                            dark:hover:border-[#5EEAD4]
                            dark:hover:text-[#5EEAD4]
                            sm:flex
                        "
                    >
                        <Globe2 size={18} />
                        <span>PT</span>
                        <ChevronDown size={14} />
                    </button>

                    <Link
                        href="/"
                        className="
                            flex h-11 items-center gap-2
                            rounded-xl
                            border border-slate-300
                            px-4
                            text-sm font-semibold
                            text-[#102E55]
                            transition
                            hover:border-[#14B8A6]
                            hover:bg-[#14B8A6]/5
                            hover:text-[#0F9E90]
                            dark:border-white/25
                            dark:text-white
                            dark:hover:border-[#5EEAD4]
                            dark:hover:bg-white/5
                            dark:hover:text-[#5EEAD4]
                        "
                    >
                        <ArrowLeft size={17} />

                        <span className="hidden sm:inline">
                            Voltar ao site
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
