import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

function CampoPalavraPasse({ id, label, value, onChange, autoComplete, inputRef, erro, colSpan, hint }) {
    const [visivel, setVisivel] = useState(false);

    return (
        <div className={colSpan}>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    type={visivel ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    className={fieldClass}
                />

                <button
                    type="button"
                    onClick={() => setVisivel((atual) => !atual)}
                    aria-label={visivel ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:hover:text-slate-200"
                >
                    {visivel ? <EyeOff size={17} strokeWidth={1.9} /> : <Eye size={17} strokeWidth={1.9} />}
                </button>
            </div>

            {hint && !erro && (
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
            )}

            <InputError message={erro} className="mt-1.5" />
        </div>
    );
}

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const naoCoincide =
        data.password_confirmation.length > 0 && data.password !== data.password_confirmation;

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                    <KeyRound size={22} strokeWidth={1.9} />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Alterar palavra-passe
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Utiliza uma palavra-passe longa e única para manter a conta segura.
                    </p>
                </div>
            </div>

            <form onSubmit={updatePassword} className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <CampoPalavraPasse
                        id="current_password"
                        label="Palavra-passe atual"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        inputRef={currentPasswordInput}
                        erro={errors.current_password}
                        colSpan="sm:col-span-2"
                    />

                    <CampoPalavraPasse
                        id="password"
                        label="Nova palavra-passe"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        inputRef={passwordInput}
                        erro={errors.password}
                        hint="Mínimo de 8 caracteres."
                    />

                    <CampoPalavraPasse
                        id="password_confirmation"
                        label="Confirmar palavra-passe"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        erro={errors.password_confirmation}
                        hint={
                            naoCoincide ? (
                                <span className="flex items-center gap-1 text-red-500">
                                    <AlertCircle size={13} strokeWidth={2} />
                                    As palavras-passe não coincidem.
                                </span>
                            ) : null
                        }
                    />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
                            <CheckCircle2 size={16} strokeWidth={2} />
                            Guardado.
                        </span>
                    </Transition>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'A atualizar...' : 'Atualizar palavra-passe'}
                    </button>
                </div>
            </form>
        </section>
    );
}
