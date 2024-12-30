import { Product } from "./product";

export interface PrintedProduct {
    product: Product;
    batchNumber: string;
    bestBefore: string;
    kolli: number;
    printDate: Date;
    drivenDate?: Date;
    packingSlipId: number;
}