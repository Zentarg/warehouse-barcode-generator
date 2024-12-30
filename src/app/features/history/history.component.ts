import { Component } from '@angular/core';
import { PrintedProductsService } from '../../core/services/printed-products.service';
import { DatePipe, NgFor } from '@angular/common';
import { BarcodeHelperService } from '../../core/services/barcode-helper.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  get printedProducts() {
    return this.printedProductsService.printedProducts;
  }

  constructor(private printedProductsService: PrintedProductsService, public barcodeHelperService: BarcodeHelperService) {}


  // Will be used in packing slip
  getIdenticalPrints(ean: string, kolli: number, bestBefore: string): number {
    return this.printedProductsService.printedProducts.filter(printedProduct => {
      return printedProduct.product.EAN === ean && printedProduct.kolli === kolli && printedProduct.bestBefore == bestBefore;
    }).length;
  };

  getEANPrintCount(ean: string) {
    return this.printedProductsService.printedProducts.filter(printedProduct => {
      return printedProduct.product.EAN === ean;
    }).length;
  }

  get orderedPrintedProducts() {
    return this.printedProductsService.printedProducts.sort((a, b) => {

      if (a.drivenDate === null || a.drivenDate === undefined) {
        return -1;
      } else if (b.drivenDate === null || b.drivenDate === undefined) {
        return 1;
      }

      return new Date(b.drivenDate).getTime() - new Date(a.drivenDate).getTime();
    });
  }

}
