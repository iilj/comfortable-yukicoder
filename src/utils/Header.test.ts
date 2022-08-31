import { getHeader } from './Header';

describe('getHeader', (): void => {
    test('should work.', (): void => {
        expect(getHeader(0)).toBe('A');
        expect(getHeader(1)).toBe('B');
        expect(getHeader(2)).toBe('C');
        expect(getHeader(3)).toBe('D');
        expect(getHeader(4)).toBe('E');
        expect(getHeader(24)).toBe('Y');
        expect(getHeader(25)).toBe('Z');
        expect(getHeader(26)).toBe('AA');
        expect(getHeader(27)).toBe('AB');
        expect(getHeader(50)).toBe('AY');
        expect(getHeader(51)).toBe('AZ');
        expect(getHeader(52)).toBe('BA');
        expect(getHeader(53)).toBe('BB');
        expect(getHeader(700)).toBe('ZY');
        expect(getHeader(701)).toBe('ZZ');
        expect(getHeader(702)).toBe('AAA');
        expect(getHeader(703)).toBe('AAB');
    });
});
