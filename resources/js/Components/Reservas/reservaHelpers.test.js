import { describe, expect, it } from 'vitest';
import {
    calcularDataFim,
    criarDataLocal,
    formatarDataInput,
    podeCancelarReserva,
} from './reservaHelpers';

describe('regras de datas das reservas', () => {
    it('calcula sete dias inclusivos para uma reserva semanal', () => {
        expect(calcularDataFim('2026-08-31', 'semanal')).toBe('2026-09-06');
    });

    it('não deixa uma reserva mensal de 31 de janeiro transbordar para março', () => {
        expect(calcularDataFim('2025-01-31', 'mensal')).toBe('2025-02-27');
    });

    it('trata corretamente um plano anual iniciado num dia bissexto', () => {
        expect(calcularDataFim('2024-02-29', 'anual')).toBe('2025-02-27');
    });

    it('converte datas sem as deslocar por causa do fuso horário', () => {
        const data = criarDataLocal('2026-08-31');

        expect(formatarDataInput(data)).toBe('2026-08-31');
    });
});

describe('cancelamento de reservas', () => {
    it('permite cancelar uma reserva confirmada sem check-in', () => {
        expect(podeCancelarReserva({
            check_in_at: null,
            estado_reserva: { codigo: 'confirmada' },
        })).toBe(true);
    });

    it.each(['cancelada', 'expirada', 'concluida', 'nao_compareceu'])(
        'impede cancelar uma reserva no estado %s',
        (codigo) => {
            expect(podeCancelarReserva({
                check_in_at: null,
                estado_reserva: { codigo },
            })).toBe(false);
        },
    );

    it('impede cancelar depois do check-in', () => {
        expect(podeCancelarReserva({
            check_in_at: '2026-08-31T09:00:00Z',
            estado_reserva: { codigo: 'confirmada' },
        })).toBe(false);
    });
});
