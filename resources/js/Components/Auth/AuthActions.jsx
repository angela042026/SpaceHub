import { FcGoogle } from 'react-icons/fc';

export default function AuthActions({
    processing,
    disabled = false,
    submitText,
    processingText,
    submitIcon: SubmitIcon,
    googleText = '',
    onGoogleClick,
    showSecondary = true,
}) {
    return (
        <>
            <button
                type="submit"
                disabled={processing || disabled}
                className="
                    mt-6 flex h-14 w-full
                    items-center justify-center
                    gap-3 rounded-xl
                    bg-gradient-to-r
                    from-[#14B8A6]
                    to-[#0F9E90]
                    text-base font-bold
                    text-white
                    shadow-[0_12px_30px_rgba(20,184,166,0.24)]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_16px_36px_rgba(20,184,166,0.34)]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#14B8A6]/25
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                "
            >
                {SubmitIcon && (
                    <SubmitIcon
                        size={21}
                        aria-hidden="true"
                    />
                )}

                {processing
                    ? processingText
                    : submitText}
            </button>

            {showSecondary && (
                <>
                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/15" />

                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            ou
                        </span>

                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/15" />
                    </div>

                    <button
                        type="button"
                        onClick={onGoogleClick}
                        className="
                            flex h-14 w-full
                            items-center justify-center
                            gap-3 rounded-2xl
                            border border-slate-300
                            bg-white
                            font-semibold
                            text-slate-800
                            shadow-sm
                            transition-all duration-200
                            hover:-translate-y-0.5
                            hover:border-[#14B8A6]
                            hover:bg-slate-50
                            hover:shadow-md
                            focus:outline-none
                            focus:ring-4
                            focus:ring-[#14B8A6]/15
                            dark:border-slate-700
                            dark:bg-slate-900
                            dark:text-white
                            dark:hover:border-[#5EEAD4]
                            dark:hover:bg-white/5
                        "
                    >
                        <FcGoogle
                            size={22}
                            aria-hidden="true"
                        />

                        {googleText}
                    </button>
                </>
            )}
        </>
    );
}
