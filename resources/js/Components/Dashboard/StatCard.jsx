export default function StatCard({ title, value, icon, color, change }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-500',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-500',
        slate: 'bg-slate-100 text-slate-600',
    };

    const changeColor = change?.startsWith('-')
        ? 'text-red-500'
        : 'text-emerald-600';

    return (
        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${colors[color]}`}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-1 text-3xl font-bold text-slate-900">
                        {value}
                    </h3>

                    <p className={`mt-1 text-xs font-medium ${changeColor}`}>
                        {change}
                    </p>
                </div>
            </div>
        </div>
    );
}
