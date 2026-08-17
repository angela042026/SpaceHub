import { Armchair, CalendarCheck, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function ColunaAtividade({ icon: Icon, valor, label, titulo }) {
    return (
        <div
            className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-1 text-center"
            title={titulo}
        >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                <Icon size={16} strokeWidth={1.9} />
            </span>

            <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-[#f8fafc]">
                {valor}
            </p>

            <p className="text-[11px] font-semibold leading-tight text-slate-500 dark:text-[#8fa7bd]">
                {label}
            </p>
        </div>
    );
}

export default function AtividadePessoal({ atividade }) {
    const { t } = useTranslation('dashboard');

    if (!atividade) {
        return null;
    }

    const {
        diasNoEscritorioMes = 0,
        checkinsRealizados = 0,
        secretariaFavorita = null,
    } = atividade;

    return (
        <section className="dashboard-card flex h-full flex-col p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                {t('atividadePessoal.titulo')}
            </h2>

            <div className="mt-3 grid flex-1 grid-cols-3 divide-x divide-slate-100 dark:divide-[#2a5069]">
                <ColunaAtividade
                    icon={CalendarCheck}
                    valor={diasNoEscritorioMes}
                    label={t('atividadePessoal.diaEsteMes', { count: diasNoEscritorioMes })}
                />

                <ColunaAtividade
                    icon={Armchair}
                    valor={secretariaFavorita?.codigo ?? '—'}
                    label={t('atividadePessoal.secretariaFavorita')}
                    titulo={
                        secretariaFavorita
                            ? `${secretariaFavorita.setor} · ${secretariaFavorita.piso}`
                            : t('atividadePessoal.aindaSemDados')
                    }
                />

                <ColunaAtividade
                    icon={QrCode}
                    valor={checkinsRealizados}
                    label={t('atividadePessoal.checkinEsteMes', { count: checkinsRealizados })}
                />
            </div>
        </section>
    );
}
