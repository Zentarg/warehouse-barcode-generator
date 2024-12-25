import { AfterViewInit, Component, OnInit } from '@angular/core';
import bwipjs from 'bwip-js';
import { Product } from '../../core/models/product';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  imports: [],
  templateUrl: './barcodes.component.html',
  styleUrl: './barcodes.component.scss'
})
export class BarcodesComponent implements AfterViewInit {
  barcode1: string = "";
  product: Product = {
    EAN: "5706216504008",
    SSCCWithoutChecksum: "05706216504008048",
    amount: 4,
    unit: '175 ltr.',
    title: 'Smage-Compagniet A/S<br>Holmevej 10 - DK-5683 Haarby<br>Rema Alkoholfri Æblegløgg 0,7 ltr.<br>4 x 175 flasker',
    expirationDays: 30
  };
  constructor() {}
  async ngAfterViewInit(): Promise<void> {
    try {
      let canvas = bwipjs.toCanvas('barcode', {
        bcid: 'gs1-128', // Barcode type,
        text: `(15)${this.expirationDate}(10)${this.batchNumber}`, // Text to encode
        // text: '(15)260222(10)220824', // Text to encode
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
      });
      let canvas2 = bwipjs.toCanvas('barcode2', {
        bcid: 'gs1-128', // Barcode type,
        text: `(02)0${this.product.EAN}(37)${this.product.amount}`, // Text to encode
        // text: '(02)05701161715721(37)80',
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
      });
      const data = this.product.SSCCWithoutChecksum;
      const checkDigit = this.calculateGS1128CheckDigit(data);
      let canvas3 = bwipjs.toCanvas('barcode3', {
        bcid: 'gs1-128', // Barcode type,
        text: `(00)${data}${checkDigit}`,
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
        
      });
    } catch (e) {
      console.error(e);
    }
  }
  
  calculateGS1128CheckDigit(data: string): number {
    const weights = [3, 1];
    let sum = 0;
  
    // Iterate over the data string in reverse order
    for (let i = data.length - 1; i >= 0; i--) {
      const digit = parseInt(data[i], 10);
      if (isNaN(digit)) {
        throw new Error('Invalid character in GS1-128 data');
      }
      sum += digit * weights[(data.length - 1 - i) % 2];
    }
  
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  }

  get batchNumber(): string {
    let date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}${month}${year}`;
  }

  get expirationDate(): string {
    let date = new Date();
    date.setDate(date.getDate() + this.product.expirationDays);
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
