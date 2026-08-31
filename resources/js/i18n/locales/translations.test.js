import { describe, expect, it } from 'vitest';
import dashboardEn from './en/dashboard.json';
import reservasEn from './en/reservas.json';
import dashboardPt from './pt/dashboard.json';
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
