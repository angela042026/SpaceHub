import InputError from '@/Components/InputError';

export default function AuthField({
    id,
    label,
    icon: Icon,
    type = 'text',
    name,
    value,
    placeholder,
    autoComplete,
    autoFocus = false,
    error,
    onChange,
    className = '',
}) {
    const errorId = `${id}-error`;

    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="
                    mb-2 block
                    text-sm font-bold
                    text-[#102E55]
                    dark:text-white
                "
            >
                {label}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={20}
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute left-4 top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />
                )}

                <input
                    id={id}
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error ? errorId : undefined
                    }
                    onChange={onChange}
                    className="
                        h-14 w-full
                        rounded-xl
                        border border-slate-300
                        bg-white
                        pl-12 pr-4
                        text-[#102E55]
                        shadow-sm
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        hover:border-slate-400
                        focus:border-[#14B8A6]
                        focus:ring-4
                        focus:ring-[#14B8A6]/10
                        dark:border-white/20
                        dark:bg-[#071A30]
                        dark:text-white
                        dark:placeholder:text-slate-500
                        dark:hover:border-white/30
                        dark:focus:border-[#5EEAD4]
                    "
                />
            </div>

            <InputError
                id={errorId}
                message={error}
                className="mt-2"
            />
        </div>
    );
}
