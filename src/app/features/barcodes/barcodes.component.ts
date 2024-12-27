
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import bwipjs from 'bwip-js';
import { Product } from '../../core/models/product';
import { ProductsService } from '../../core/services/products.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodeHelperService } from '../../core/services/barcode-helper.service';
import { After } from 'v8';
import { PrintOptions } from '../../core/models/print-options';
import { SettingsService } from '../../core/services/settings.service';
import { ToastSettings, ToastType } from '../../core/models/toast-settings';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './barcodes.component.html',
  styleUrl: './barcodes.component.scss'
})
export class BarcodesComponent implements OnInit, OnDestroy {
  _kolliBarcode: string = '';
  _selectedProduct: Product | undefined;

  ean: string = '';
  _batchNumber: string = '';
  _expirationDate: string = '';
  _kolli: number = 0;
  _automaticPrint: boolean = false;
  _isPrinting: boolean = false;
  _automaticPrintCountdown: number = 0;
  automaticPrintCountdownInterval: any;

  constructor(private productsService: ProductsService, public barcodeHelperService: BarcodeHelperService, public settingsService: SettingsService, private cdr: ChangeDetectorRef, private toastService: ToastService) {
  }
  ngOnDestroy(): void {
    clearInterval(this.automaticPrintCountdownInterval);
  }

  ngOnInit(): void {
    if (window.electron) {
      window.electron.ipcRenderer.on('print-started', (event, options: PrintOptions) => {
        this.afterPrint();
        console.log(`Print started: EAN: ${options.EAN} | SSCC: ${options.SSCC}`);
        this.toastService.showToast({
          text: `Printer:<br>EAN: ${options.EAN} | SSCC: ${options.SSCC}`,
          showCloseButton: false,
          type: ToastType.success,
        });
      });
      window.electron.ipcRenderer.on('print-failed', (event, errorType) => {
        console.log(`Print failed: ${errorType}`);
        this.toastService.showToast({
          text: `Print mislykkedes: ${errorType}`,
          showCloseButton: true,
          type: ToastType.error,
        });
        this.isPrinting = false;
        this.cdr.detectChanges();
      });
    }
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

  startAutomaticPrint(): void {
    if (!this.selectedProduct || !this.canAutomaticPrint)
      return;

    this.isPrinting = true;
    this.resetAutomaticPrintCountdown();
    this.automaticPrintCountdownInterval = setInterval(() => {
      this.automaticPrintCountdown = Math.round((this.automaticPrintCountdown - 0.1) * 10) / 10;
      if (this.automaticPrintCountdown <= 0) {
        const dpi = 96;
        const cmToPixels = (cm: number) => Math.round(cm * dpi / 2.54);
        const cmToMicrons = (cm: number) => cm * 10000;

        const printOptions: PrintOptions = {
          deviceName: this.settingsService.settings.labelPrinter!.name,
          pageWidth: cmToMicrons(10),
          pageHeight: cmToMicrons(15),
          SSCC: this.selectedProduct!.SSCCWithoutChecksum,
          EAN: this.selectedProduct!.EAN,
          dpi: dpi,
          margins: {
            top: cmToPixels(0.5),
            right: cmToPixels(0.5),
            bottom: cmToPixels(0.5),
            left: cmToPixels(0.5)
          }
        }
        window.electron.ipcRenderer.invoke('print-silent', printOptions);

        clearInterval(this.automaticPrintCountdownInterval);
      }
    }, 100);
  }

  resetAutomaticPrintCountdown(): void {
    this.automaticPrintCountdown = this.settingsService.settings.automaticPrintTimer ?? 10;
  }

  print(): void {
    window.onafterprint = () => {
      this.afterPrint();
    }
    window.print();
  }

  afterPrint(): void {
    const index = this.products.findIndex(product => product.EAN === this.selectedProduct?.EAN);
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
    
    this.isPrinting = false;
    this.cdr.detectChanges();
  }

  get selectedProduct(): Product | undefined {
    return this._selectedProduct;
  };

  set selectedProduct(product: Product | undefined) {
    this._selectedProduct = product;
    this.updateBarcodes();
  };

  get batchNumber(): string {
    return this._batchNumber;
  }

  set batchNumber(value: string) {
    this._batchNumber = value;
    this.resetAutomaticPrintCountdown();
    this.updateBarcodes();
  }

  get expirationDate(): string {
    return this._expirationDate;
  }

  set expirationDate(value: string) {
    this._expirationDate = value;
    this.resetAutomaticPrintCountdown();
    this.updateBarcodes();
  }

  get kolli(): number {
    return this._kolli;
  }

  set kolli(value: number) {
    this._kolli = value;
    this.resetAutomaticPrintCountdown();
    this.updateBarcodes();
  }

  get kolliBarcode(): string {
    return this._kolliBarcode;
  }

  set kolliBarcode(value: string) {
    this._kolliBarcode = value;
    let { ean, batchNumber, expirationDate } = this.barcodeHelperService.seperateKolliBarcode(value);
    this.ean = ean;
    this._batchNumber = batchNumber;
    this._expirationDate = expirationDate;
    this._kolli = this.products[0].kolli;
    this.selectedProduct = this.products[0];

    if (this.automaticPrint)
      this.startAutomaticPrint();
  }

  get products(): Product[] {
    return this.productsService.products.filter(product => this.kolliBarcode == '' || this.kolliBarcode.includes(product.EAN));
  }

  get automaticPrint(): boolean {
    return this._automaticPrint;
  }

  set automaticPrint(value: boolean) {
    this._automaticPrint = value;
    if (!value)
      clearInterval(this.automaticPrintCountdownInterval);
  }

  get isPrinting(): boolean {
    return this._isPrinting;
  }

  set isPrinting(value: boolean) {
    this._isPrinting = value;
  }

  get automaticPrintCountdown(): number {
    return this._automaticPrintCountdown;
  }

  set automaticPrintCountdown(value: number) {
    this._automaticPrintCountdown = value;
  }

  get canAutomaticPrint(): boolean {
    return this.settingsService.settings.labelPrinter != undefined;
  }

}
