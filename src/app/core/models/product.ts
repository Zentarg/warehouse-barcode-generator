export interface Product {
    company: string;
    EAN: string;
    productNumber: number;
    productName: string;
    title: string;
    SSCCWithoutChecksum: string;
    kolli: number;
    type: string;
    amountPerKolli: number;
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
        case 'productName':
            return 'Produkt';
        case 'productNumber':
            return 'Vare nr';
        case 'type':
            return 'Art';
        case 'amountPerKolli':
            return 'Antal pr. kolli';
    }
    return '';
}