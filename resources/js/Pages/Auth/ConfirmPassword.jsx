import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthLayout from '@/Components/Auth/AuthLayout';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ShieldCheck,
} from 'lucide-react';

export default function ConfirmPassword() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.confirm'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirmar senha" />

            <AuthLayout
                title="Confirme a sua"
                highlightedTitle="senha"
                subtitle="Por segurança, confirme a sua senha antes de continuar."
                heroTitle="Área protegida."
                heroPrefix="Acesso"
                heroHighlightedTitle="seguro."
                heroDescription="Esta verificação ajuda a proteger os seus dados e as ações sensíveis da sua conta."
            >
                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <div
                            className="
                                mb-5 flex items-start gap-3
                                rounded-xl
                                border border-slate-200
                                bg-slate-50
                                px-4 py-3
                                text-sm leading-6
                                text-slate-600
                                dark:border-white/10
                                dark:bg-white/5
                                dark:text-slate-300
                            "
                        >
                            <ShieldCheck
                                size={20}
                                aria-hidden="true"
                                className="
                                    mt-0.5 shrink-0
                                    text-[#14B8A6]
                                    dark:text-[#5EEAD4]
                                "
                            />

                            <p>
                                Esta é uma área segura da aplicação.
                                Confirme a sua senha para continuar.
                            </p>
                        </div>

                        <PasswordField
                            id="password"
                            label="Senha"
                            name="password"
                            value={data.password}
                            placeholder="Introduza a sua senha"
                            autoComplete="current-password"
                            error={errors.password}
                            onChange={(event) =>
                                setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        />

                        <AuthActions
                            processing={processing}
                            submitText="Confirmar"
                            processingText="A confirmar..."
                            submitIcon={ShieldCheck}
                            showSecondary={false}
                        />
                    </AuthCard>
                </form>

                <p
                    className="
                        mt-6 text-center
                        text-sm text-slate-600
                        dark:text-slate-300
                    "
                >
                    Não pretende continuar?{' '}

                    <Link
                        href={route('dashboard')}
                        className="
                            inline-flex items-center gap-1
                            font-semibold
                            text-[#0F9E90]
                            underline-offset-4
                            transition
                            hover:underline
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#14B8A6]/30
                            dark:text-[#5EEAD4]
                        "
                    >
                        <ArrowLeft
                            size={15}
                            aria-hidden="true"
                        />

                        Voltar ao dashboard
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
