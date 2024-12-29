export interface Product {
    company: string;
    EAN: string;
    title: string;
    SSCCWithoutChecksum: string;
    kolli: number;
}

export function ProductKeyToLabel(key: keyof Product): string {
    switch (key) {
        case 'company':
            return 'Firma';
        case 'EAN':
            return 'EAN';
        case 'title':
            return 'Titel';
        case 'SSCCWithoutChecksum':
            return 'SSCC';
        case 'kolli':
            return 'Kolli';
    }
    return '';
}