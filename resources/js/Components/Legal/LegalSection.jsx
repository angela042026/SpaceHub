export default function LegalSection({
    id,
    number,
    title,
    children,
}) {
    return (
        <section
            id={id}
            className="scroll-mt-28 border-t border-slate-100 pt-8 first:mt-0 first:border-t-0 first:pt-0 dark:border-white/10"
        >
            <h2
                className="
                    flex items-baseline gap-3
                    text-xl font-bold
                    text-[#102E55]
                    dark:text-white
                "
            >
                <span className="text-[#14B8A6] dark:text-[#5EEAD4]">
                    {number}.
                </span>

                {title}
            </h2>

            <div
                className="
                    mt-4 space-y-4
                    text-[15px] leading-7
                    text-slate-600
                    dark:text-slate-300
                    [&_a]:font-semibold [&_a]:text-[#0F9E90]
                    [&_a]:underline-offset-4 [&_a]:transition
                    [&_a]:hover:underline
                    dark:[&_a]:text-[#5EEAD4]
                    [&_li]:leading-6
                    [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
                "
            >
                {children}
            </div>
        </section>
    );
}
