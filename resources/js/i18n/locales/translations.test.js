import { describe, expect, it } from 'vitest';
import dashboardEn from './en/dashboard.json';
import landingEn from './en/landing.json';
import relatoriosEn from './en/relatorios.json';
import reservasEn from './en/reservas.json';
import dashboardPt from './pt/dashboard.json';
import landingPt from './pt/landing.json';
import relatoriosPt from './pt/relatorios.json';
import reservasPt from './pt/reservas.json';

describe('traduções dos estados de disponibilidade', () => {
    it('usa Available nos rótulos ingleses', () => {
        expect(dashboardEn.officeMap.estados.livre).toBe('Available');
        expect(dashboardEn.officeMap.filtros.livres).toBe('Available');
        expect(dashboardEn.reservationCard.livre).toBe('Available');
        expect(reservasEn.disponibilidade.livre).toBe('Available');
    });

    it('mantém os rótulos portugueses em português', () => {
        expect(dashboardPt.officeMap.estados.livre).toBe('Livre');
        expect(dashboardPt.reservationCard.livre).toBe('Livre');
        expect(reservasPt.disponibilidade.livre).toBe('Livre');
    });
});

describe('traduções do Google Calendar na landing page', () => {
    it('apresenta o nome Google Calendar nos dois idiomas', () => {
        expect(landingPt.features.googleCalendar.titulo).toBe('Google Calendar');
        expect(landingEn.features.googleCalendar.titulo).toBe('Google Calendar');
    });

    it('define todos os textos usados pelo cartão', () => {
        for (const landing of [landingPt, landingEn]) {
            expect(landing.features.googleCalendar.descricao).toBeTruthy();
            expect(landing.features.googleCalendar.exemploEspaco).toBeTruthy();
            expect(landing.features.googleCalendar.sincronizado).toBeTruthy();
        }
    });
});

describe('traduções da impressão de relatórios', () => {
    it('traduz o botão de impressão', () => {
        expect(relatoriosPt.impressao.imprimir).toBe('Imprimir');
        expect(relatoriosEn.impressao.imprimir).toBe('Print');
    });

    it('define cabeçalho e rodapé nos dois idiomas', () => {
        for (const relatorios of [relatoriosPt, relatoriosEn]) {
            expect(relatorios.impressao.geradoEm).toContain('{{data}}');
            expect(relatorios.impressao.por).toContain('{{nome}}');
            expect(relatorios.impressao.rodape).toContain('{{data}}');
            expect(relatorios.impressao.rodape).toContain('{{nome}}');
        }
    });
});
