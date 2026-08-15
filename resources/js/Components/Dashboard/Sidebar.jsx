import { Link, usePage } from '@inertiajs/react';

import {
    Home,
    LayoutDashboard,
    CalendarPlus,
    CalendarDays,
    QrCode,
    Map,
    History,
    Users,
    Building2,
    Layers,
    MapPinned,
    Armchair,
    BarChart3,
    Settings,
    LogOut,
    X,
    FileText,
    Search,
    CreditCard,
    HelpCircle,
    LifeBuoy,
    Star,
} from 'lucide-react';

function SidebarItem({
    icon: Icon,
    label,
    href,
    active = false,
    onNavigate,
}) {
    const content = (
        <>
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
        </>
    );

    if (!href) {
        return (
            <div className="sidebar-link cursor-not-allowed opacity-60 hover:bg-white/5">
                {content}
            </div>
        );
    }

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={active ? 'sidebar-link-active' : 'sidebar-link'}
        >
            {content}
        </Link>
    );
}

export default function Sidebar({
    open = false,
    onClose = () => {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleName = user?.role?.nome;

    const isAdmin =
        roleName === 'Administrador' ||
        roleName === 'Gestor';

    // O Registo de Atividade é só para Administrador (ver
    // ActivityLogPolicy::viewAny) — mais restrito do que "isAdmin", que
    // também inclui Gestor. Gestor não vê o item, para não apontar para
    // uma página que lhe devolveria 403.
    const isAdministrador = roleName === 'Administrador';

    return (
        <>
            {open && (
                <button
                    type="button"
                    aria-label="Fechar menu lateral"
                    className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 flex h-screen w-72 shrink-0 flex-col bg-navy-950 px-5 py-7 text-white shadow-2xl transition-transform duration-300 print:hidden lg:sticky lg:top-0 lg:w-[272px] lg:self-start lg:translate-x-0 ${
                    open
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >
                <div className="mb-6 border-b border-white/5 pb-6">
                    <Link
                        href={route('dashboard')}
                        className="flex items-center justify-center"
                    >
                        <img
                            src="/images/logo/logobranco.png"
                            alt="SpaceHub"
                            className="h-20 w-auto object-contain"
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-lg p-1 text-slate-300 hover:bg-white/10 lg:hidden"
                    >
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <div className="spacehub-scroll min-h-0 flex-1 overflow-y-auto pb-2 pr-2">
                    <nav className="space-y-2">
                        <SidebarItem
                            icon={Home}
                            label="Página Inicial"
                            href={route('home')}
                            active={route().current('home')}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={CalendarPlus}
                            label="Reservar Espaço"
                            href={route('reservas.create')}
                            active={route().current(
                                'reservas.create',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={CalendarDays}
                            label="Minhas Reservas"
                            href={route('reservas.index')}
                            active={route().current(
                                'reservas.index',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={Search}
                            label="Disponibilidade"
                            href={route(
                                'reservas.availability',
                            )}
                            active={route().current(
                                'reservas.availability',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={QrCode}
                            label="Check-in"
                            href={route('checkin.camera')}
                            active={route().current('checkin.*')}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={Map}
                            label="Mapa do Escritório"
                            href={route('mapa.index')}
                            active={route().current(
                                'mapa.index',
                            ) || route().current(
                                'setores.mapa.edit',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={History}
                            label="Histórico"
                            href={route('reservas.history')}
                            active={route().current(
                                'reservas.history',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={CreditCard}
                            label="Pagamentos"
                            href={route('pagamentos.index')}
                            active={route().current(
                                'pagamentos.*',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={Star}
                            label="Minhas Avaliações"
                            href={route('avaliacoes.index')}
                            active={route().current(
                                'avaliacoes.index',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={HelpCircle}
                            label="Central de ajuda"
                            href={route('faqs.index')}
                            active={route().current(
                                'faqs.index',
                            ) || route().current(
                                'support.create',
                            )}
                            onNavigate={onClose}
                        />

                        <SidebarItem
                            icon={Settings}
                            label="Definições"
                            href={route('profile.edit')}
                            active={route().current(
                                'profile.edit',
                            )}
                            onNavigate={onClose}
                        />
                    </nav>

                    {isAdmin && (
                        <>
                            <div className="my-6 border-t border-white/10" />

                            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Administração
                            </p>

                            <nav className="space-y-2">
                                <SidebarItem
                                    icon={Users}
                                    label="Utilizadores"
                                    href={route(
                                        'admin.users.index',
                                    )}
                                    active={route().current(
                                        'admin.users.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={Building2}
                                    label="Edifícios"
                                    href={route(
                                        'admin.edificios.index',
                                    )}
                                    active={route().current(
                                        'admin.edificios.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={Layers}
                                    label="Pisos"
                                    href={route(
                                        'admin.pisos.index',
                                    )}
                                    active={route().current(
                                        'admin.pisos.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={MapPinned}
                                    label="Setores"
                                    href={route(
                                        'admin.setores.index',
                                    )}
                                    active={route().current(
                                        'admin.setores.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={Armchair}
                                    label="Secretárias"
                                    href={route(
                                        'admin.secretarias.index',
                                    )}
                                    active={route().current(
                                        'admin.secretarias.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={CalendarDays}
                                    label="Reservas"
                                    href={route(
                                        'admin.reservas.index',
                                    )}
                                    active={route().current(
                                        'admin.reservas.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={QrCode}
                                    label="QR Codes"
                                    href={route(
                                        'secretarias.qrcodes',
                                    )}
                                    active={route().current(
                                        'secretarias.qrcodes',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={MapPinned}
                                    label="Editor do Mapa"
                                    href={route(
                                        'setores.mapa.edit',
                                    )}
                                    active={route().current(
                                        'setores.mapa.edit',
                                    )}
                                    onNavigate={onClose}
                                />

                                {isAdministrador && (
                                    <SidebarItem
                                        icon={History}
                                        label="Registo de Atividade"
                                        href={route(
                                            'admin.atividade.index',
                                        )}
                                        active={route().current(
                                            'admin.atividade.*',
                                        )}
                                        onNavigate={onClose}
                                    />
                                )}

                                <SidebarItem
                                    icon={BarChart3}
                                    label="Estatísticas"
                                    href={route(
                                        'admin.statistics.index',
                                    )}
                                    active={route().current(
                                        'admin.statistics.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={FileText}
                                    label="Relatórios"
                                    href={route(
                                        'admin.reports.index',
                                    )}
                                    active={route().current(
                                        'admin.reports.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={Star}
                                    label="Avaliações"
                                    href={route(
                                        'admin.avaliacoes.index',
                                    )}
                                    active={route().current(
                                        'admin.avaliacoes.*',
                                    )}
                                    onNavigate={onClose}
                                />

                                <SidebarItem
                                    icon={LifeBuoy}
                                    label="Pedidos de Suporte"
                                    href={route(
                                        'support.index',
                                    )}
                                    active={route().current(
                                        'support.index',
                                    ) || route().current(
                                        'support.show',
                                    )}
                                    onNavigate={onClose}
                                />
                            </nav>
                        </>
                    )}
                </div>

                <div className="mt-5 flex shrink-0 items-center gap-3 border-t border-white/10 pt-5">
                    {user?.fotografia_url ? (
                        <img
                            src={user.fotografia_url}
                            alt={user.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500 text-lg font-bold text-white">
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() ?? '?'}
                        </div>
                    )}

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
                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                        />
                    </Link>
                </div>
            </aside>
        </>
    );
}