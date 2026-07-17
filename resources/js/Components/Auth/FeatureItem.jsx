export default function FeatureItem({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div
                className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-[#14B8A6]/25
                    bg-[#14B8A6]/10
                    text-[#14B8A6]
                    dark:border-[#5EEAD4]/25
                    dark:text-[#5EEAD4]
                "
            >
                <Icon size={23} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
                <p className="font-semibold text-[#102E55] dark:text-white">
                    {title}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    {description}
                </p>
            </div>
        </div>
    );
}
