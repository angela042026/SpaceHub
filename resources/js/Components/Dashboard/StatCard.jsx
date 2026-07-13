import {
    ArrowDownRight,
    ArrowUpRight,
    Minus,
} from 'lucide-react';

export default function StatCard({
    title,
    value,
    icon: Icon,
    changePercent,
}) {
    const hasChange =
        changePercent !== null &&
        changePercent !== undefined;

    const isNegative = hasChange && changePercent < 0;
    const isPositive = hasChange && changePercent > 0;

    let changeText = 'Sem dados de ontem';

    if (hasChange) {
        let signal = '';

        if (changePercent > 0) {
            signal = '+';
        }

        changeText = `${signal}${changePercent}% vs ontem`;
    }

    let changeColor = 'text-slate-400';

    if (isNegative) {
        changeColor = 'text-red-500';
    } else if (isPositive) {
        changeColor = 'text-teal-500';
    }

    return (
        <div className="group min-h-[145px] rounded-3xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/30 hover:shadow-2xl dark:border-slate-800 dark:bg-card">
            <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {title}
                        </p>

                        <h3 className="mt-2 text-4xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">
                            {value}
                        </h3>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 transition-all duration-300 group-hover:scale-105 group-hover:bg-teal-500 group-hover:text-white group-hover:shadow-lg">
                        <Icon
                            size={24}
                            strokeWidth={2}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-3 h-px w-full bg-slate-100 dark:bg-slate-800" />

                    <div className="flex items-center gap-2">
                        {isPositive && (
                            <ArrowUpRight
                                size={15}
                                strokeWidth={2.4}
                                className="text-teal-500"
                            />
                        )}

                        {isNegative && (
                            <ArrowDownRight
                                size={15}
                                strokeWidth={2.4}
                                className="text-red-500"
                            />
                        )}

                        {!isPositive && !isNegative && (
                            <Minus
                                size={15}
                                strokeWidth={2.4}
                                className="text-slate-400"
                            />
                        )}

                        <span className={`text-xs font-semibold ${changeColor}`}>
                            {changeText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
