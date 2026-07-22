import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, UserCog } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                    <UserCog size={22} strokeWidth={1.9} />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Dados do Perfil
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Atualiza o teu nome e endereço de email.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className={labelClass}>Nome</label>

                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            className={fieldClass}
                        />

                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>Email</label>

                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className={fieldClass}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                        <Mail size={19} strokeWidth={1.9} className="mt-0.5 shrink-0" />

                        <div className="text-sm">
                            <p>
                                O teu endereço de email ainda não foi verificado.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-bold underline decoration-2 underline-offset-2 hover:opacity-80"
                                >
                                    Clica aqui para reenviar o email de verificação.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <p className="mt-2 font-semibold text-teal-600 dark:text-teal-400">
                                    Foi enviado um novo link de verificação para o teu email.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'A guardar...' : 'Guardar'}
                    </button>

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
                </div>
            </form>
        </section>
    );
}
