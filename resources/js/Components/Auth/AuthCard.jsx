export default function AuthCard({
    children,
    className = '',
}) {
    return (
        <div
            className={`
                rounded-2xl
                border border-slate-200
                bg-white
                p-6
                shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                dark:border-[#5EEAD4]/20
                dark:bg-[#092039]/85
                dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]
                sm:p-8
                ${className}
            `}
        >
            {children}
        </div>
    );
}
