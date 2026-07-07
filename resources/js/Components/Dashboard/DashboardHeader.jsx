export default function DashboardHeader() {
    return (
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">
                    Bem-vinda de volta 👋
                </p>

                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                    Dashboard SpaceHub
                </h1>

                <p className="mt-2 text-slate-500">
                    Gestão inteligente de espaços de trabalho.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-72 rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 shadow-sm focus:border-blue-500 focus:outline-none"
                    />

                    <span className="absolute left-4 top-3.5 text-slate-400">
                        🔍
                    </span>
                </div>

                <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    🔔

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                        H
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Hanna Sampaio
                        </p>

                        <p className="text-xs text-slate-500">
                            Administrador
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
