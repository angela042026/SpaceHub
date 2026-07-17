import InputError from '@/Components/InputError';
import {
    Eye,
    EyeOff,
    LockKeyhole,
} from 'lucide-react';
import { useState } from 'react';

export default function PasswordField({
    id,
    label,
    name,
    value,
    placeholder,
    autoComplete = 'new-password',
    error,
    onChange,
    validationState = 'default',
    className = '',
    children,
}) {
    const [visible, setVisible] = useState(false);
    const errorId = `${id}-error`;

    let borderClasses = `
        border-slate-300
        hover:border-slate-400
        focus:border-[#14B8A6]
        dark:border-white/20
        dark:hover:border-white/30
        dark:focus:border-[#5EEAD4]
    `;

    if (validationState === 'valid') {
        borderClasses = `
            border-emerald-400
            focus:border-emerald-500
            dark:border-emerald-400
        `;
    }

    if (validationState === 'invalid') {
        borderClasses = `
            border-red-400
            focus:border-red-500
            dark:border-red-400
        `;
    }

    const toggleLabel = visible
        ? `Ocultar ${label.toLowerCase()}`
        : `Mostrar ${label.toLowerCase()}`;

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
                <LockKeyhole
                    size={20}
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error ? errorId : undefined
                    }
                    onChange={onChange}
                    className={`
                        h-14 w-full
                        rounded-xl
                        border
                        bg-white
                        pl-12 pr-12
                        text-[#102E55]
                        shadow-sm
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        focus:ring-4
                        focus:ring-[#14B8A6]/10
                        dark:bg-[#071A30]
                        dark:text-white
                        dark:placeholder:text-slate-500
                        ${borderClasses}
                    `}
                />

                <button
                    type="button"
                    onClick={() =>
                        setVisible((current) => !current)
                    }
                    aria-label={toggleLabel}
                    title={toggleLabel}
                    className="
                        absolute right-3 top-1/2
                        flex h-9 w-9
                        -translate-y-1/2
                        items-center justify-center
                        rounded-lg
                        text-slate-400
                        transition-all duration-200
                        hover:bg-slate-100
                        hover:text-[#0F9E90]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#14B8A6]/30
                        dark:hover:bg-white/10
                        dark:hover:text-[#5EEAD4]
                    "
                >
                    {visible ? (
                        <EyeOff
                            size={20}
                            aria-hidden="true"
                        />
                    ) : (
                        <Eye
                            size={20}
                            aria-hidden="true"
                        />
                    )}
                </button>
            </div>

            {children}

            <InputError
                id={errorId}
                message={error}
                className="mt-2"
            />
        </div>
    );
}
