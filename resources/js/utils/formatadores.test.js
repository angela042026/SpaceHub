import { describe, expect, it } from 'vitest';
import {
    formatarData,
    formatarDataCurta,
    formatarMoeda,
} from './formatadores';

describe('formatadores localizados', () => {
    it('formata datas em português e inglês', () => {
        const data = '2026-08-31T12:00:00Z';

        expect(formatarData(data, 'pt')).toBe('31/08/2026');
        expect(formatarData(data, 'en')).toBe('31/08/2026');
        expect(formatarDataCurta(data, 'en')).toContain('Aug');
    });

    it('usa português como fallback para locales desconhecidos', () => {
        expect(formatarData('2026-08-31T12:00:00Z', 'xx')).toBe('31/08/2026');
    });

    it('formata moeda em euros nos dois idiomas', () => {
        const pt = formatarMoeda(1234.5, 'pt');
        const en = formatarMoeda(1234.5, 'en');

        expect(pt.replace(/\s/g, '')).toContain('1234,50€');
        expect(en).toContain('1,234.50');
        expect(en).toContain('€');
    });

    it('devolve um marcador quando a data não existe', () => {
        expect(formatarData(null, 'pt')).toBe('-');
        expect(formatarDataCurta('', 'en')).toBe('-');
    });
});
