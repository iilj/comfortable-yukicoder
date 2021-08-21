const header: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
];

const getHeaderFromNum = (num: number): string => {
    const idx = num - 1;
    if (idx < header.length) {
        return header[idx];
    } else {
        const r = idx % header.length;
        return getHeaderFromNum(Math.floor(idx / header.length)) + header[r];
    }
};

export const getHeader = (idx: number): string => getHeaderFromNum(idx + 1);
