import { usePage } from '@inertiajs/react';

import useTheme from '@/Hooks/useTheme';

export default function DashboardHeader({ onOpenNav = () => {} }) {
    const { auth } = usePage().props;
    const { theme, toggleTheme } = useTheme();
    const user = auth?.user;

    return (
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onOpenNav}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-card text-lg shadow-card dark:border-slate-700 lg:hidden"
                >
                    ☰
                </button>

                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Bem-vindo(a) de volta 👋
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard SpaceHub
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Gestão inteligente de espaços de trabalho.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-72 rounded-2xl border border-slate-200 bg-card py-3 pl-11 pr-4 text-slate-900 shadow-card focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    />

                    <span className="absolute left-4 top-3.5 text-slate-400">
                        🔍
                    </span>
                </div>

                <button
                    type="button"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-card shadow-card transition duration-200 hover:-translate-y-0.5 dark:border-slate-700"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-card shadow-card dark:border-slate-700">
                    🔔
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-card px-4 py-2 shadow-card dark:border-slate-700">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {user?.name ?? 'Utilizador'}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user?.role?.nome ?? '—'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
