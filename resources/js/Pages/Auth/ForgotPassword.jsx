import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthField from '@/Components/Auth/AuthField';
import AuthLayout from '@/Components/Auth/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Mail,
    Send,
} from 'lucide-react';

export default function ForgotPassword({ status }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.email'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Recuperar senha" />

            <AuthLayout
                title="Recupere a sua"
                highlightedTitle="senha"
                subtitle="Introduza o seu e-mail e enviaremos um link para definir uma nova senha."
                heroTitle="Recupere o acesso."
                heroPrefix="De forma"
                heroHighlightedTitle="segura."
                heroDescription="Enviaremos um link de recuperação para o endereço associado à sua conta."
            >
                {status && (
                    <output
                        className="
                            mb-5 block rounded-xl
                            border border-emerald-200
                            bg-emerald-50
                            px-4 py-3
                            text-sm font-medium
                            text-emerald-700
                            dark:border-emerald-400/20
                            dark:bg-emerald-400/10
                            dark:text-emerald-300
                        "
                    >
                        {status}
                    </output>
                )}

                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <div
                            className="
                                mb-5 rounded-xl
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
                            Esqueceu a sua senha? Não há problema.
                            Indique o seu e-mail e enviaremos um link
                            para criar uma nova.
                        </div>

                        <AuthField
                            id="email"
                            label="E-mail"
                            name="email"
                            type="email"
                            icon={Mail}
                            value={data.email}
                            placeholder="exemplo@spacehub.pt"
                            autoComplete="username"
                            autoFocus
                            error={errors.email}
                            onChange={(event) =>
                                setData(
                                    'email',
                                    event.target.value,
                                )
                            }
                        />

                        <AuthActions
                            processing={processing}
                            submitText="Enviar link de recuperação"
                            processingText="A enviar..."
                            submitIcon={Send}
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
                    Lembrou-se da senha?{' '}

                    <Link
                        href={route('login')}
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

                        Voltar ao login
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
