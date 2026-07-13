import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Bell,
    Menu,
    Moon,
    Sun,
} from 'lucide-react';

import useTheme from '@/Hooks/useTheme';

function getFirstAndLastName(name) {
    if (!name) {
        return 'Utilizador';
    }

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
        return parts[0];
    }

    return `${parts[0]} ${parts[parts.length - 1]}`;
}

export default function DashboardHeader({ onOpenNav = () => {} }) {
    const { auth } = usePage().props;
    const { theme, toggleTheme } = useTheme();

    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const user = auth?.user;
    const displayName = getFirstAndLastName(user?.name);

    const themeButtonClass =
        theme === 'dark'
            ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20'
            : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-white';

    const notificationButtonClass = notificationsOpen
        ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20'
        : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-white';

    function handleNotifications() {
        setNotificationsOpen((currentValue) => !currentValue);
    }

    return (
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-5">
                <button
                    type="button"
                    onClick={onOpenNav}
                    aria-label="Abrir menu lateral"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-card text-navy-900 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-500 hover:shadow-card-hover dark:border-slate-700 dark:text-white lg:hidden"
                >
                    <Menu size={22} strokeWidth={1.8} />
                </button>

                <div>
                    <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 dark:text-white">
                        Bom dia,{' '}
                        <span className="text-teal-500">
                            {displayName}
                        </span>
                    </h1>

                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                        Bem-vindo ao seu Dashboard.
                    </p>
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={
                        theme === 'dark'
                            ? 'Ativar modo claro'
                            : 'Ativar modo escuro'
                    }
                    aria-label={
                        theme === 'dark'
                            ? 'Ativar modo claro'
                            : 'Ativar modo escuro'
                    }
                    aria-pressed={theme === 'dark'}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${themeButtonClass}`}
                >
                    {theme === 'dark' ? (
                        <Sun size={20} strokeWidth={2} />
                    ) : (
                        <Moon size={20} strokeWidth={2} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleNotifications}
                    aria-label="Ver notificações"
                    aria-expanded={notificationsOpen}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-xl border shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${notificationButtonClass}`}
                >
                    <Bell size={20} strokeWidth={2} />

                    {!notificationsOpen && (
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                </button>

                {notificationsOpen && (
                    <div className="absolute right-0 top-16 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white">
                                Notificações
                            </h2>

                            <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600">
                                1 nova
                            </span>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Reserva confirmada
                            </p>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                A sua reserva foi confirmada com sucesso.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
