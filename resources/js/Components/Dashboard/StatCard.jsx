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

    const isNegative =
        hasChange && Number(changePercent) < 0;

    const isPositive =
        hasChange && Number(changePercent) > 0;

    let changeText = 'Sem dados de ontem';

    if (hasChange) {
        const signal =
            Number(changePercent) > 0 ? '+' : '';

        changeText = `${signal}${changePercent}% vs ontem`;
    }

    let changeColor = 'text-slate-400';

    if (isNegative) {
        changeColor = 'text-red-500';
    } else if (isPositive) {
        changeColor = 'text-teal-500';
    }

    return (
        <div
            className="
                group
                min-h-[145px]
                rounded-3xl
                border
                border-slate-200/70
                bg-white
                px-5
                py-5
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-teal-400/30
                hover:shadow-2xl
                dark:border-[#3b5f7d]
                dark:bg-slate-900
                dark:hover:border-teal-400/60
                sm:px-6
            "
            style={{
                backgroundImage:
                    'linear-gradient(160deg, var(--color-card, #ffffff) 0%, var(--color-card-to, #f8fafc) 100%)',
            }}
        >
            <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
                            {title}
                        </p>

                        <h3 className="mt-2 truncate text-3xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white sm:text-[42px]">
                            {value}
                        </h3>
                    </div>

                    {Icon && (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 transition-all duration-300 group-hover:scale-105 group-hover:bg-teal-500 group-hover:text-white group-hover:shadow-lg">
                            <Icon
                                size={28}
                                strokeWidth={2}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-3 h-px w-full bg-slate-100 dark:bg-[#365b79]" />

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

                        {!isPositive &&
                            !isNegative && (
                                <Minus
                                    size={15}
                                    strokeWidth={2.4}
                                    className="text-slate-400"
                                />
                            )}

                        <span
                            className={`truncate text-xs font-semibold ${changeColor}`}
                        >
                            {changeText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
