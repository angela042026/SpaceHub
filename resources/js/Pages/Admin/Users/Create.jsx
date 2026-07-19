import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    UserRound,
    UserRoundPlus,
} from 'lucide-react';
import { useState } from 'react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Create({ roles }) {
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        ativo: true,
        fotografia: null,
    });

    const passwordConfirmationMismatch =
        data.password_confirmation.length > 0 &&
        data.password !== data.password_confirmation;

    const handleFotografia = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData('fotografia', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (event) => {
        event.preventDefault();

        if (passwordConfirmationMismatch) {
            return;
        }

        post(route('admin.users.store'), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Novo utilizador" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <UserRoundPlus size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Novo utilizador
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Cria uma conta e define o papel de acesso.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="mb-6 flex items-center gap-4">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Pré-visualização"
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                                <UserRound size={26} strokeWidth={1.8} />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="fotografia"
                                className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                            >
                                Escolher fotografia
                            </label>

                            <input
                                id="fotografia"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFotografia}
                                className="hidden"
                            />

                            <InputError message={errors.fotografia} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className={labelClass}>
                                Nome completo
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                autoFocus
                                required
                                className={fieldClass}
                            />

                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>
                                E-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                required
                                className={fieldClass}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Senha
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                autoComplete="new-password"
                                required
                                className={fieldClass}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className={labelClass}>
                                Confirmar senha
                            </label>

                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                autoComplete="new-password"
                                required
                                className={fieldClass}
                            />

                            {passwordConfirmationMismatch && (
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    As senhas não coincidem.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role_id" className={labelClass}>
                                Papel
                            </label>

                            <select
                                id="role_id"
                                value={data.role_id}
                                onChange={(event) => setData('role_id', event.target.value)}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>
                                    Selecione um papel
                                </option>

                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.nome}
                                    </option>
                                ))}
                            </select>

                            <InputError message={errors.role_id} className="mt-2" />
                        </div>

                        <div className="flex items-end pb-2.5">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={data.ativo}
                                    onChange={(event) => setData('ativo', event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                />
                                Conta ativa
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <UserRoundPlus size={18} strokeWidth={2} />
                            {processing ? 'A criar...' : 'Criar utilizador'}
                        </button>

                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Cancelar
                        </Link>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
