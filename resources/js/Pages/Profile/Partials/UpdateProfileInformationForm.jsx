import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, CheckCircle2, Mail, UserCog, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const { t } = useTranslation('profile');
    const user = usePage().props.auth.user;
    const [preview, setPreview] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            fotografia: null,
        });

    const handleFotografia = (e) => {
        const file = e.target.files?.[0] ?? null;

        setData('fotografia', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                    <UserCog size={22} strokeWidth={1.9} />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('informacaoPerfil.titulo')}
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('informacaoPerfil.subtitulo')}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:gap-7">
                    {/* Avatar */}
                    <div className="flex shrink-0 flex-col items-center gap-3 sm:w-44">
                        <div className="relative">
                            {preview || user.fotografia_url ? (
                                <img
                                    src={preview ?? user.fotografia_url}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                                    <UserRound size={38} strokeWidth={1.6} />
                                </div>
                            )}

                            <label
                                htmlFor="fotografia"
                                aria-label={t('informacaoPerfil.trocarFotografia')}
                                className="absolute bottom-0.5 right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-teal-600 shadow-md ring-1 ring-slate-200 transition hover:bg-teal-50 dark:bg-slate-800 dark:text-teal-400 dark:ring-slate-700"
                            >
                                <Camera size={15} strokeWidth={2} />
                            </label>

                            <input
                                id="fotografia"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFotografia}
                                className="hidden"
                            />
                        </div>

                        <label
                            htmlFor="fotografia"
                            className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('informacaoPerfil.alterarFotografia')}
                        </label>

                        <InputError message={errors.fotografia} className="text-center" />
                    </div>

                    {/* Divisória vertical discreta */}
                    <div className="hidden w-px shrink-0 self-stretch bg-slate-100 dark:bg-slate-800 sm:block" />

                    {/* Campos */}
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div>
                            <div className="grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className={labelClass}>
                                        {t('informacaoPerfil.nome')}
                                    </label>

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
                                    <label htmlFor="email" className={labelClass}>
                                        {t('informacaoPerfil.email')}
                                    </label>

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
                                <div className="mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                                    <Mail size={19} strokeWidth={1.9} className="mt-0.5 shrink-0" />

                                    <div className="text-sm">
                                        <p>
                                            {t('informacaoPerfil.emailNaoVerificado')}{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="font-bold underline decoration-2 underline-offset-2 hover:opacity-80"
                                            >
                                                {t('informacaoPerfil.clicaAquiParaReenviar')}
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <p className="mt-2 font-semibold text-teal-600 dark:text-teal-400">
                                                {t('informacaoPerfil.linkVerificacaoEnviado')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alinhado ao fundo da coluna, à mesma altura do "Alterar fotografia" */}
                        <div className="mt-6 flex items-center justify-end gap-3 sm:mt-auto sm:pt-6">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
                                    <CheckCircle2 size={16} strokeWidth={2} />
                                    {t('informacaoPerfil.guardado')}
                                </span>
                            </Transition>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? t('informacaoPerfil.aGuardar') : t('informacaoPerfil.guardarAlteracoes')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
