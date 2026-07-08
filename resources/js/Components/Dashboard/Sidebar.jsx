import { Link, usePage } from '@inertiajs/react';

function SidebarItem({ icon, label, href, active = false, onNavigate }) {
    if (!href) {
        return (
            <div className="sidebar-link cursor-not-allowed justify-between opacity-40 hover:bg-transparent hover:text-slate-300">
                <span className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    {label}
                </span>
                <span className="rounded-pill bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    Em breve
                </span>
            </div>
        );
    }

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={active ? 'sidebar-link-active' : 'sidebar-link'}
        >
            <span className="text-lg">{icon}</span>
            {label}
        </Link>
    );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleName = user?.role?.nome;
    const isAdmin = roleName === 'Administrador' || roleName === 'Gestor';

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col bg-navy-950 px-5 py-7 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="mb-10 flex items-center justify-between gap-3">
                    <Link href={route('dashboard')} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-card">
                            <img
                                src="/images/logo/spacehub-logo.png"
                                alt="SpaceHub"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="leading-tight">
                            <p className="font-display text-lg font-bold tracking-wide">
                                SPACE<span className="text-teal-400">HUB</span>
                            </p>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400">
                                O seu espaço. Quando precisar.
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-300 hover:bg-white/10 lg:hidden"
                    >
                        ✕
                    </button>
                </div>

                <nav className="space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon="▦"
                        label="Dashboard"
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        onNavigate={onClose}
                    />
                    <SidebarItem icon="📅" label="Reservar Espaço" />
                    <SidebarItem icon="🗓️" label="Minhas Reservas" />
                    <SidebarItem
                        icon="✅"
                        label="Check-in"
                        href={route('checkin.camera')}
                        active={route().current('checkin.*')}
                        onNavigate={onClose}
                    />
                    <SidebarItem icon="🗺️" label="Mapa do Escritório" />
                    <SidebarItem icon="🕘" label="Histórico" />
                </nav>

                {isAdmin && (
                    <>
                        <div className="my-6 border-t border-white/10" />

                        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Administração
                        </p>

                        <nav className="space-y-2 overflow-y-auto">
                            <SidebarItem icon="👥" label="Utilizadores" />
                            <SidebarItem icon="🏢" label="Localidades" />
                            <SidebarItem icon="▤" label="Pisos" />
                            <SidebarItem icon="📍" label="Setores" />
                            <SidebarItem
                                icon="🪑"
                                label="Secretárias"
                                href={route('secretarias.qrcodes')}
                                active={route().current('secretarias.qrcodes')}
                                onNavigate={onClose}
                            />
                            <SidebarItem
                                icon="📍"
                                label="Editor do Mapa"
                                href={route('setores.mapa.edit')}
                                active={route().current('setores.mapa.edit')}
                                onNavigate={onClose}
                            />
                            <SidebarItem icon="📅" label="Reservas" />
                            <SidebarItem icon="📊" label="Relatórios" />
                            <SidebarItem icon="⚙️" label="Definições" />
                        </nav>
                    </>
                )}

                <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                            {user?.name ?? 'Utilizador'}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                            {user?.email ?? ''}
                        </p>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Terminar sessão"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        ⏻
                    </Link>
                </div>
            </aside>
        </>
    );
}
