import { Component } from '@angular/core';
import { PrintedProductsService } from '../../core/services/printed-products.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { BarcodeHelperService } from '../../core/services/barcode-helper.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, DatePipe, RouterLink, NgIf],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  get printedProducts() {
    return this.printedProductsService.printedProducts;
  }

  constructor(private printedProductsService: PrintedProductsService, public barcodeHelperService: BarcodeHelperService) {}

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
