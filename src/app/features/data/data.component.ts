import { Component, ElementRef, ViewChild } from '@angular/core';
import { Product } from '../../core/models/product';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  _products: Product[] = [ 
    {
      EAN: '1234567890123',
      SSCCWithoutChecksum: '123456789012345678',
      amount: 1,
      unit: '175 ltr.',
      title: 'Product 1',
      expirationDays: 365
    },
    {
      EAN: '1234567890124',
      SSCCWithoutChecksum: '123456789012345679',
      amount: 2,
      unit: '40 ltr.',
      title: 'Product 2',
      expirationDays: 365
    },
    {
      EAN: '1234567890125',
      SSCCWithoutChecksum: '123456789012345680',
      amount: 3,
      unit: '30 ltr.',
      title: 'Product 3',
      expirationDays: 365
    }
  ];

  search: string = '';

  get products() {
    return this._products.filter(product => product.EAN.includes(this.search));
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.processCSV(text);
      };
      reader.readAsText(file);
    }
  }

  processCSV(csv: string): void {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index].trim();
        return obj;
      }, {} as any);
    });

    console.log(data); // Process the CSV data as needed
  }
  
}
