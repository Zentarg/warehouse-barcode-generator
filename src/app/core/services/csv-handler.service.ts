import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { BarcodeHelperService } from './barcode-helper.service';
import { ToastService } from './toast.service';
import { ToastType } from '../models/toast-settings';

@Injectable({
  providedIn: 'root'
})
export class CsvHandlerService {

  constructor(private barcodeHelperService: BarcodeHelperService, private toastService: ToastService) { }



  
  processCSV(csv: string): Product[] {
    try {
      const lines = csv.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return headers.reduce((obj, header, index) => {
          const key = header.trim() as keyof Product;
          let value: string | number = values[index].trim();
  
          switch (key) {
            case 'kolli':
            case 'productNumber':
            case 'amountPerKolli':
              const parsedInt = parseInt(value, 10);
                obj[key] = parsedInt;
              break;
            case 'SSCCWithoutChecksum':
              let val = value.trim();
              if (this.barcodeHelperService.hasValidCheckDigit(val) && val.length == 18)
                obj[key] = val.slice(0, -1);
              else
                obj[key] = val;
              break;
            default:
              obj[key] = value.trim();
              break;
          }
  
          return obj;
        }, {} as Product);
      });
      return data;
    } catch(e) {
      console.error(e);
      this.toastService.showToast({
        text: 'Invalid CSV format: ' + e,
        type: ToastType.error,
        showCloseButton: true,
      });
      return [];
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  public exportCSV(products: Product[]) {
    const tempProduct: Product = {
      company: "",
      EAN: "",
      productNumber: 0,
      productName: "",
      title: "",
      SSCCWithoutChecksum: "",
      kolli: 0,
      type: "",
      amountPerKolli: 0,
    }
    const headers = Object.keys(tempProduct);
    const csv = products.map((product) => {
      return headers.map((header) => {
        switch (header) {
          case 'SSCCWithoutChecksum':
            return product[header as keyof Product] + this.barcodeHelperService.calculateGS1128CheckDigit(product[header as keyof Product] as string).toString();
          case 'productName':
          case 'title':
            if (!product[header as keyof Product])
              return '';
            return `"${product[header as keyof Product]}"`;
          default:
            if (!product[header as keyof Product])
              return '';
            return product[header as keyof Product];
        }
      }).join(',')
    }).join('\n');
    const blob = new Blob([headers.join(',') + '\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
