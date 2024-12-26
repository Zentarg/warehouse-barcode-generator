
import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import bwipjs from 'bwip-js';
import { Product } from '../../core/models/product';
import { ProductsService } from '../../core/services/products.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodeHelperService } from '../../core/services/barcode-helper.service';
import { After } from 'v8';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './barcodes.component.html',
  styleUrl: './barcodes.component.scss'
})
export class BarcodesComponent implements AfterContentInit{
  _kolliBarcode: string = '';
  _selectedProduct: Product | undefined;

  ean: string = '';
  _batchNumber: string = '';
  _expirationDate: string = '';
  _kolli: number = 0;

  products: Product[] = [];

  constructor(private productsService: ProductsService, public barcodeHelperService: BarcodeHelperService) {
    this.products = productsService.products;
  }
  ngAfterContentInit(): void {
    this.selectedProduct = this.products[0];
  }

  updateBarcodes(): void {
    let canvas1 = document.getElementById('barcode1') as HTMLCanvasElement;
    let canvas2 = document.getElementById('barcode2') as HTMLCanvasElement;
    let canvas3 = document.getElementById('barcode3') as HTMLCanvasElement;

    // Clear the canvases
    let ctx1 = canvas1.getContext('2d');
    let ctx2 = canvas2.getContext('2d');
    let ctx3 = canvas3.getContext('2d');
    ctx1?.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2?.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx3?.clearRect(0, 0, canvas3.width, canvas3.height);
    
    if (!this.selectedProduct)
      return;
    try {
      let batchBarcodeText = "";
      if (this.expirationDate)
        batchBarcodeText += `(15)${this.barcodeHelperService.reverseDate(this.expirationDate)}`;
      batchBarcodeText += `(10)${this.batchNumber}`;
      let canvas = bwipjs.toCanvas('barcode1', {
        bcid: 'gs1-128', // Barcode type,
        text: batchBarcodeText, // Text to encode
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
        height: 10,
      });
      let canvas2 = bwipjs.toCanvas('barcode2', {
        bcid: 'gs1-128', // Barcode type,
        text: `(02)0${this.selectedProduct.EAN}(37)${this.kolli}`, // Text to encode
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
        height: 10,
      });
      const data = this.selectedProduct.SSCCWithoutChecksum;
      const checkDigit = this.barcodeHelperService.calculateGS1128CheckDigit(data);
      let canvas3 = bwipjs.toCanvas('barcode3', {
        bcid: 'gs1-128', // Barcode type,
        text: `(00)${data}${checkDigit}`,
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
        height: 10,
        
      });
    } catch (e) {
      console.error(e);
    }
    
  }

  print(): void {
    window.onafterprint = () => {
      const index = this.products.findIndex(product => product.EAN === this.selectedProduct?.EAN);
      console.log(index, this.products, this.selectedProduct?.EAN);
      if (index == -1)
        return;
      let sscc = this.products[index].SSCCWithoutChecksum;
      if (this.barcodeHelperService.hasValidCheckDigit(this.products[index].SSCCWithoutChecksum))
        sscc = this.products[index].SSCCWithoutChecksum.slice(0, -1);
      const leadingZeros = this.barcodeHelperService.countLeadingZeros(this.products[index].SSCCWithoutChecksum);
      let ssccWithoutLeading = +this.products[index].SSCCWithoutChecksum.slice(leadingZeros);
      ssccWithoutLeading++;
      const dupedProduct = this.products.find(product => product.SSCCWithoutChecksum == `${'0'.repeat(leadingZeros)}${ssccWithoutLeading}`);
      if (dupedProduct)
        alert(`Et produkt med samme SSCC eksisterer allerede: EAN: ${dupedProduct.EAN} | SSCC: ${dupedProduct.SSCCWithoutChecksum} | Titel: ${dupedProduct.title.replaceAll('\\n', ' ')}`);
      this.products[index].SSCCWithoutChecksum = `${'0'.repeat(leadingZeros)}${ssccWithoutLeading}`;
      this.productsService.saveProducts();
    }
    window.print();
  }

  get selectedProduct(): Product | undefined {
    return this._selectedProduct;
  };

  set selectedProduct(product: Product | undefined) {
    this._selectedProduct = product;
    this.updateBarcodes();
  };

  get kolliBarcode(): string {
    return this._kolliBarcode;
  }

  get batchNumber(): string {
    return this._batchNumber;
  }

  set batchNumber(value: string) {
    this._batchNumber = value;
    this.updateBarcodes();
  }

  get expirationDate(): string {
    return this._expirationDate;
  }

  set expirationDate(value: string) {
    this._expirationDate = value;
    this.updateBarcodes();
  }

  get kolli(): number {
    return this._kolli;
  }

  set kolli(value: number) {
    this._kolli = value;
    this.updateBarcodes();
  }


  set kolliBarcode(value: string) {
    this._kolliBarcode = value;
    this.products = this.productsService.products.filter(product => this.kolliBarcode.includes(product.EAN));
    let { ean, batchNumber, expirationDate } = this.barcodeHelperService.seperateKolliBarcode(value);
    this.ean = ean;
    this._batchNumber = batchNumber;
    this._expirationDate = expirationDate;
    this._kolli = this.products[0].kolli;
    this.selectedProduct = this.products[0];
  }

}
