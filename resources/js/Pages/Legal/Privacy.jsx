import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
    const { t } = useTranslation('legal');

    const SECTIONS = [
        { id: 'introducao', title: t('privacy.sections.introducao') },
        { id: 'dados-recolhidos', title: t('privacy.sections.dadosRecolhidos') },
        { id: 'finalidade', title: t('privacy.sections.finalidade') },
        { id: 'base-legal', title: t('privacy.sections.baseLegal') },
        { id: 'partilha', title: t('privacy.sections.partilha') },
        { id: 'conservacao', title: t('privacy.sections.conservacao') },
        { id: 'direitos', title: t('privacy.sections.direitos') },
        { id: 'seguranca', title: t('privacy.sections.seguranca') },
        { id: 'cookies', title: t('privacy.sections.cookies') },
        { id: 'alteracoes', title: t('privacy.sections.alteracoes') },
        { id: 'contacto', title: t('privacy.sections.contacto') },
    ];

    return (
        <>
            <Head title={t('privacy.titulo')} />

            <LegalLayout
                icon={ShieldCheck}
                title={t('privacy.titulo')}
                subtitle={t('privacy.subtitulo')}
                updatedAt={t('privacy.atualizadoEm')}
                sections={SECTIONS}
            >
                <LegalSection
                    id="introducao"
                    number={1}
                    title={t('privacy.sections.introducao')}
                >
                    <p>{t('privacy.introducao.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="dados-recolhidos"
                    number={2}
                    title={t('privacy.sections.dadosRecolhidos')}
                >
                    <p>{t('privacy.dadosRecolhidos.intro')}</p>

                    <ul>
                        <li>
                            <strong>{t('privacy.dadosRecolhidos.li1Strong')}</strong>{' '}
                            {t('privacy.dadosRecolhidos.li1')}
                        </li>
                        <li>
                            <strong>{t('privacy.dadosRecolhidos.li2Strong')}</strong>{' '}
                            {t('privacy.dadosRecolhidos.li2')}
                        </li>
                        <li>
                            <strong>{t('privacy.dadosRecolhidos.li3Strong')}</strong>{' '}
                            {t('privacy.dadosRecolhidos.li3')}
                        </li>
                        <li>
                            <strong>{t('privacy.dadosRecolhidos.li4Strong')}</strong>{' '}
                            {t('privacy.dadosRecolhidos.li4')}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="finalidade"
                    number={3}
                    title={t('privacy.sections.finalidade')}
                >
                    <p>{t('privacy.finalidade.intro')}</p>

                    <ul>
                        <li>{t('privacy.finalidade.li1')}</li>
                        <li>{t('privacy.finalidade.li2')}</li>
                        <li>{t('privacy.finalidade.li3')}</li>
                        <li>{t('privacy.finalidade.li4')}</li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="base-legal"
                    number={4}
                    title={t('privacy.sections.baseLegal')}
                >
                    <p>
                        {t('privacy.baseLegal.parte1')}{' '}
                        <strong>{t('privacy.baseLegal.execucaoContrato')}</strong>{' '}
                        {t('privacy.baseLegal.parte2')}{' '}
                        <strong>{t('privacy.baseLegal.cumprimentoObrigacoes')}</strong>{' '}
                        {t('privacy.baseLegal.parte3')}{' '}
                        <strong>{t('privacy.baseLegal.consentimentoExplicito')}</strong>
                        {t('privacy.baseLegal.parte4')}
                    </p>
                </LegalSection>

                <LegalSection
                    id="partilha"
                    number={5}
                    title={t('privacy.sections.partilha')}
                >
                    <p>{t('privacy.partilha.intro')}</p>

                    <ul>
                        <li>
                            <strong>{t('privacy.partilha.li1Strong')}</strong>{' '}
                            {t('privacy.partilha.li1')}
                        </li>
                        <li>
                            <strong>{t('privacy.partilha.li2Strong')}</strong>{' '}
                            {t('privacy.partilha.li2')}
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="conservacao"
                    number={6}
                    title={t('privacy.sections.conservacao')}
                >
                    <p>{t('privacy.conservacao.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="direitos"
                    number={7}
                    title={t('privacy.sections.direitos')}
                >
                    <p>{t('privacy.direitos.paragrafo1')}</p>

                    <p>{t('privacy.direitos.paragrafo2')}</p>
                </LegalSection>

                <LegalSection
                    id="seguranca"
                    number={8}
                    title={t('privacy.sections.seguranca')}
                >
                    <p>{t('privacy.seguranca.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="cookies"
                    number={9}
                    title={t('privacy.sections.cookies')}
                >
                    <p>
                        {t('privacy.cookies.parte1')}{' '}
                        <Link href={route('legal.cookies')}>
                            {t('privacy.cookies.linkTexto')}
                        </Link>
                        .
                    </p>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={10}
                    title={t('privacy.sections.alteracoes')}
                >
                    <p>{t('privacy.alteracoes.texto')}</p>
                </LegalSection>

                <LegalSection
                    id="contacto"
                    number={11}
                    title={t('privacy.sections.contacto')}
                >
                    <p>{t('privacy.contacto.texto')}</p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
