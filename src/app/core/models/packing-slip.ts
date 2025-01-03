import { PrintedProduct } from "./printed-product";

export interface PackingSlip {
    id: number;
    title: string;
    address: string;
    orderNumber: string;
    dateCreated: Date;
    datePrinted?: Date;
    deliveryDate: Date;
    printedProducts: PrintedProduct[];
    deliveredPalletCount: number;
    deliveredQuarterPalletCount: number;
}

export function PackingSlipKeyToLabel(key: keyof PackingSlip): string {
    switch (key) {
        case 'id':
            return 'Id';
        case 'title':
            return 'Titel';
        case 'address':
            return 'Adresse';
        case 'orderNumber':
            return 'Ordre nr.';
        case 'dateCreated':
            return 'Oprettet';
        case 'datePrinted':
            return 'Printet';
        case 'deliveryDate':
            return 'Leveringsdato';
        case 'printedProducts':
            return 'Printede produkter';
    }
    return '';
}