import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Terms() {
    const { t } = useTranslation('legal');

    const SECTIONS = [
        { id: 'aceitacao', title: t('terms.sections.aceitacao') },
        { id: 'conta', title: t('terms.sections.conta') },
        { id: 'reservas', title: t('terms.sections.reservas') },
        { id: 'conduta', title: t('terms.sections.conduta') },
        { id: 'propriedade', title: t('terms.sections.propriedade') },
        { id: 'suspensao', title: t('terms.sections.suspensao') },
        { id: 'responsabilidade', title: t('terms.sections.responsabilidade') },
        { id: 'alteracoes', title: t('terms.sections.alteracoes') },
        { id: 'contacto', title: t('terms.sections.contacto') },
    ];

    return (
        <>
            <Head title={t('terms.titulo')} />

            <LegalLayout
                icon={FileText}
                title={t('terms.titulo')}
                subtitle={t('terms.subtitulo')}
                updatedAt={t('terms.atualizadoEm')}
                sections={SECTIONS}
            >
                <LegalSection
                    id="aceitacao"
                    number={1}
                    title={t('terms.sections.aceitacao')}
                >
                    <p>
                        {t('terms.aceitacao.parte1')}{' '}
                        <a href="/politica-privacidade">
                            {t('terms.aceitacao.linkTexto')}
                        </a>
                        {t('terms.aceitacao.parte2')}
                    </p>
                </LegalSection>

                <LegalSection
                    id="conta"
                    number={2}
                    title={t('terms.sections.conta')}
                >
                    <p>{t('terms.conta.intro')}</p>

                    <ul>
                        <li>{t('terms.conta.li1')}</li>
                        <li>{t('terms.conta.li2')}</li>
                        <li>{t('terms.conta.li3')}</li>
                    </ul>

                    <p>{t('terms.conta.paragrafo2')}</p>
                </LegalSection>

                <LegalSection
                    id="reservas"
                    number={3}
                    title={t('terms.sections.reservas')}
                >
                    <p>{t('terms.reservas.intro')}</p>

                    <ul>
                        <li>{t('terms.reservas.li1')}</li>
                        <li>{t('terms.reservas.li2')}</li>
                        <li>{t('terms.reservas.li3')}</li>
                    </ul>

                    <p>{t('terms.reservas.paragrafo2')}</p>
                </LegalSection>

                <LegalSection
                    id="conduta"
                    number={4}
                    title={t('terms.sections.conduta')}
                >
                    <p>{t('terms.conduta.intro')}</p>

                    <ul>
                        <li>{t('terms.conduta.li1')}</li>
                        <li>{t('terms.conduta.li2')}</li>
                        <li>{t('terms.conduta.li3')}</li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="propriedade"
                    number={5}
                    title={t('terms.sections.propriedade')}
                >
                    <p>{t('terms.propriedade.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="suspensao"
                    number={6}
                    title={t('terms.sections.suspensao')}
                >
                    <p>{t('terms.suspensao.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="responsabilidade"
                    number={7}
                    title={t('terms.sections.responsabilidade')}
                >
                    <p>{t('terms.responsabilidade.paragrafo1')}</p>

                    <p>{t('terms.responsabilidade.paragrafo2')}</p>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={8}
                    title={t('terms.sections.alteracoes')}
                >
                    <p>{t('terms.alteracoes.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="contacto"
                    number={9}
                    title={t('terms.sections.contacto')}
                >
                    <p>{t('terms.contacto.texto')}</p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
