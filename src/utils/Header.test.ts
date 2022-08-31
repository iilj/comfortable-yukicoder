import { getHeader } from './Header';

describe('getHeader', (): void => {
    test('should work.', (): void => {
        expect(getHeader(0)).toBe('A');
    });
});
