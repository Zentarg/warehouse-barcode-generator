import { Injectable } from '@angular/core';
import { PrintedProduct } from '../models/printed-product';

@Injectable({
  providedIn: 'root'
})
export class PrintedProductsService {
  private readonly storageKey = 'printed_products';
  private _printedProducts: PrintedProduct[] = [];

  constructor() {
    this.loadPrintedProducts();
  }

  get printedProducts(): PrintedProduct[] {
    return this._printedProducts;
  }

  addPrintedProducts(printedProducts: PrintedProduct[]): void {
    printedProducts.forEach(printedProduct => {
      console.log(printedProduct.product.SSCCWithoutChecksum, this._printedProducts.find(p => p.product.SSCCWithoutChecksum === printedProduct.product.SSCCWithoutChecksum)?.product?.SSCCWithoutChecksum)
      if (!this._printedProducts.find(p => p.product.SSCCWithoutChecksum === printedProduct.product.SSCCWithoutChecksum))
        this._printedProducts.push(printedProduct);
      else {
        const index = this._printedProducts.findIndex(p => p.product.SSCCWithoutChecksum === printedProduct.product.SSCCWithoutChecksum);
        this._printedProducts[index] = printedProduct;
      }
    });
    this.savePrintedProducts();
  }

  removePrintedProducts(printedProducts: PrintedProduct[]): void {
    this._printedProducts = this._printedProducts.filter(p => !printedProducts.find(printedProduct => printedProduct.product.SSCCWithoutChecksum === p.product.SSCCWithoutChecksum));
    this.savePrintedProducts();
  }

  public savePrintedProducts(): void {
    if (window.electronStore)
      window.electronStore.set(this.storageKey, JSON.stringify(this._printedProducts));
    else
      localStorage.setItem(this.storageKey, JSON.stringify(this._printedProducts));
  }

  private async loadPrintedProducts(): Promise<void> {
    let printedProducts;
    if (window.electronStore)
      printedProducts = await window.electronStore.get(this.storageKey);
    else
      printedProducts = localStorage.getItem(this.storageKey);
    if (printedProducts) {
      this._printedProducts = JSON.parse(printedProducts);
    }
  }


}