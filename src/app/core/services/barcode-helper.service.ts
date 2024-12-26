import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BarcodeHelperService {
  public calculateGS1128CheckDigit(data: string): number {
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
  
  public hasValidCheckDigit(data: string): boolean {
    if (data.length < 2) {
      return false;
    }

    const dataWithoutCheckDigit = data.slice(0, -1);
    const providedCheckDigit = parseInt(data.slice(-1), 10);

    if (isNaN(providedCheckDigit)) {
      return false;
    }

    const calculatedCheckDigit = this.calculateGS1128CheckDigit(dataWithoutCheckDigit);
    return providedCheckDigit === calculatedCheckDigit;
  }

  public countLeadingZeros(value: string): number {
    let count = 0;
    for (let char of value) {
      if (char === '0') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  public seperateKolliBarcode(kolliBarcode: string): { ean: string, batchNumber: string, expirationDate: string } {
    const ean = kolliBarcode.slice(0, 13);
    const batchNumber = kolliBarcode.slice(13, 19);
    const expirationDate = kolliBarcode.slice(19, 27);
    return { ean, batchNumber, expirationDate };
  }

  public reverseDate(date: string): string {
    return date.slice(4, 8) + date.slice(2, 4) + date.slice(0, 2);
  }

  public addSeperatorsToDate(date: string): string {
    return date.slice(0, 2) + '.' + date.slice(2, 4) + '.' + date.slice(4, 8);
  }
}
