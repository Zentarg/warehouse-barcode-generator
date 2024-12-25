export interface Product {
    EAN: string;
    SSCCWithoutChecksum: string;
    amount: number;
    unit: string;
    title: string;
    expirationDays: number;
}