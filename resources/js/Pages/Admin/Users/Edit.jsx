import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { etiquetaRole } from '@/utils/estados';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ user, roles }) {
    const { t } = useTranslation('admin');
    const { t: tc } = useTranslation('common');
    const [preview, setPreview] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        password_confirmation: '',
        role_id: user.role_id ?? '',
        fotografia: null,
    });

    // O useForm só inicializa uma vez, na primeira montagem. Se se navegar
    // desta página para editar outro utilizador (ou para "Criar utilizador")
    // sem recarregar, o React reaproveita o mesmo componente e o formulário
    // fica preso nos dados antigos — por isso sincroniza-se aqui sempre que
    // o utilizador realmente muda.
    useEffect(() => {
        setData({
            name: user.name ?? '',
            email: user.email ?? '',
            password: '',
            password_confirmation: '',
            role_id: user.role_id ?? '',
            fotografia: null,
        });
        setPreview(null);
    }, [user.id]);

    const passwordConfirmationMismatch =
        data.password.length > 0 &&
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

        put(route('admin.users.update', user.id), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={t('users.edit.headTitle', { nome: user.name })} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('users.edit.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="mb-6 flex items-center gap-4">
                        {preview || user.fotografia_url ? (
                            <img
                                src={preview ?? user.fotografia_url}
                                alt={user.name}
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
                                {t('users.edit.trocarFotografia')}
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
                                {t('users.create.nomeCompleto')}
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
                                {t('campos.email')}
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
                                {t('users.edit.novaSenha')}
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                autoComplete="new-password"
                                placeholder={t('users.edit.deixarBranco')}
                                className={fieldClass}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className={labelClass}>
                                {t('users.edit.confirmarNovaSenha')}
                            </label>

                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                autoComplete="new-password"
                                className={fieldClass}
                            />

                            {passwordConfirmationMismatch && (
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    {t('users.create.senhasNaoCoincidem')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role_id" className={labelClass}>
                                {t('users.create.papel')}
                            </label>

                            <select
                                id="role_id"
                                value={data.role_id}
                                onChange={(event) => setData('role_id', event.target.value)}
                                required
                                className={fieldClass}
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {etiquetaRole(role.nome, tc)}
                                    </option>
                                ))}
                            </select>

                            <InputError message={errors.role_id} className="mt-2" />
                        </div>

                        <div className="flex items-end pb-2.5">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                    user.ativo
                                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                }`}
                            >
                                {user.ativo ? t('users.edit.contaAtiva') : t('users.edit.contaDesativada')}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Pencil size={18} strokeWidth={2} />
                            {processing ? t('form.aGuardar') : t('form.guardarAlteracoes')}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            {t('form.cancelar')}
                        </button>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
