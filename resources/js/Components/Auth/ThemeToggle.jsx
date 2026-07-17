import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({
    theme,
    onToggle,
}) {
    const darkMode = theme === 'dark';

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={
                darkMode
                    ? 'Ativar modo claro'
                    : 'Ativar modo escuro'
            }
            title={
                darkMode
                    ? 'Ativar modo claro'
                    : 'Ativar modo escuro'
            }
            className="
                flex h-11 w-11 items-center justify-center
                rounded-xl border border-slate-200
                bg-white text-slate-700 shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#14B8A6]
                hover:text-[#0F9E90]
                hover:shadow-md
                dark:border-white/15
                dark:bg-white/5
                dark:text-slate-200
                dark:hover:border-[#5EEAD4]
                dark:hover:bg-white/10
                dark:hover:text-[#5EEAD4]
            "
        >
            {darkMode ? (
                <Sun size={20} strokeWidth={2} />
            ) : (
                <Moon size={20} strokeWidth={2} />
            )}
        </button>
    );
}
