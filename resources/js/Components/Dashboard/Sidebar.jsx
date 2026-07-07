function SidebarItem({ icon, label, active = false }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
        >
            <span className="text-lg">{icon}</span>
            {label}
        </div>
    );
}

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col bg-[#061A3A] px-5 py-7 text-white shadow-2xl lg:flex">
            <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-2xl">
                    🏢
                </div>

                <h1 className="text-2xl font-bold tracking-wide">
                    SPACE<span className="text-cyan-400">HUB</span>
                </h1>
            </div>

            <nav className="space-y-2">
                <SidebarItem icon="▦" label="Dashboard" active />
                <SidebarItem icon="📅" label="Reservar Espaço" />
                <SidebarItem icon="🗓️" label="Minhas Reservas" />
                <SidebarItem icon="✅" label="Check-in" />
                <SidebarItem icon="🗺️" label="Mapa do Escritório" />
                <SidebarItem icon="🕘" label="Histórico" />
            </nav>

            <div className="my-6 border-t border-white/10" />

            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Administração
            </p>

            <nav className="space-y-2">
                <SidebarItem icon="👥" label="Utilizadores" />
                <SidebarItem icon="🏢" label="Localidades" />
                <SidebarItem icon="▤" label="Pisos" />
                <SidebarItem icon="📍" label="Setores" />
                <SidebarItem icon="🪑" label="Secretárias" />
                <SidebarItem icon="📅" label="Reservas" />
                <SidebarItem icon="📊" label="Relatórios" />
                <SidebarItem icon="⚙️" label="Definições" />
            </nav>

            <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
                <div className="h-12 w-12 rounded-full bg-slate-300" />

                <div>
                    <p className="text-sm font-semibold">Hanna Sampaio</p>
                    <p className="text-xs text-slate-400">hanna@cesae.pt</p>
                </div>
            </div>
        </aside>
    );
}
