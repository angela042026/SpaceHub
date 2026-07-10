export default function StatCard({ title, value, icon, color, changePercent }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        orange: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
        red: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
        slate: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
    };

    const hasChange = changePercent !== null && changePercent !== undefined;
    const changeColor = hasChange
        ? changePercent < 0
            ? 'text-red-500'
            : 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-400 dark:text-slate-500';
    const changeText = hasChange
        ? `${changePercent > 0 ? '+' : ''}${changePercent}% vs ontem`
        : 'Sem dados de ontem';

    return (
        <div className="stat-card">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${colors[color]}`}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </h3>

                    <p className={`mt-1 text-xs font-medium ${changeColor}`}>
                        {changeText}
                    </p>
                </div>
            </div>
        </div>
    );
}
