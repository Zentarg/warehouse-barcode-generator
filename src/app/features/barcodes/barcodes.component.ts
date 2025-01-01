
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
import { PrintedProductsService } from '../../core/services/printed-products.service';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { ModalService } from '../../core/services/modal.service';

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

  constructor(private productsService: ProductsService, public barcodeHelperService: BarcodeHelperService, public settingsService: SettingsService, private cdr: ChangeDetectorRef, private toastService: ToastService, private printedProductsService: PrintedProductsService, private modalService: ModalService) {
  }
  ngOnDestroy(): void {
    clearInterval(this.automaticPrintCountdownInterval);
    if (window.electron) {
      window.electron.ipcRenderer.removeAllListeners('print-started');
      window.electron.ipcRenderer.removeAllListeners('print-failed');
    }
  }

  ngOnInit(): void {
    if (window.electron) {
      window.electron.ipcRenderer.on('print-started', this.handlePrintStarted.bind(this));
      window.electron.ipcRenderer.on('print-failed', this.handlePrintFailed.bind(this));
    }
  }

  handlePrintStarted(event: any, options: PrintOptions) {
    this.afterPrint();
    console.log(`Print started: EAN: ${options.EAN} | SSCC: ${options.SSCC}`);
    this.toastService.showToast({
      text: `Printer:<br>EAN: ${options.EAN}<br>SSCC: ${options.SSCC + this.barcodeHelperService.calculateGS1128CheckDigit(options.SSCC)}`,
      showCloseButton: false,
      type: ToastType.success,
      duration: 5000,
    });
  }

  async handlePrintFailed(event: any, error: any) {
    console.log(`Print failed: ${error.errorType}`);
    this.toastService.showToast({
      text: `Print mislykkedes: ${error.errorType}<br>EAN: ${error.options.EAN}<br>SSCC: ${error.options.SSCC + this.barcodeHelperService.calculateGS1128CheckDigit(error.options.SSCC)}`,
      showCloseButton: true,
      type: ToastType.error,
    });

    this.isPrinting = false;
    this.cdr.detectChanges();
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
    clearInterval(this.automaticPrintCountdownInterval);
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
          copies: 2,
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

    if (window.electron) {
      const dpi = 96;
        const cmToPixels = (cm: number) => Math.round(cm * dpi / 2.54);
        const cmToMicrons = (cm: number) => cm * 10000;

        const printOptions: PrintOptions = {
          deviceName: this.settingsService.settings.labelPrinter?.name ?? '',
          pageWidth: cmToMicrons(10),
          pageHeight: cmToMicrons(15),
          SSCC: this.selectedProduct!.SSCCWithoutChecksum,
          EAN: this.selectedProduct!.EAN,
          dpi: dpi,
          copies: 2,
          margins: {
            top: cmToPixels(0.5),
            right: cmToPixels(0.5),
            bottom: cmToPixels(0.5),
            left: cmToPixels(0.5)
          }
        }
        window.electron.ipcRenderer.invoke('print', printOptions);
    } else {
      window.onafterprint = () => {
        this.afterPrint();
      }
      window.print();
    }
  }

  async afterPrint(): Promise<void> {
    const index = this.products.findIndex(product => product.EAN === this.selectedProduct?.EAN);
    if (index == -1)
      return;
    let sscc = this.products[index].SSCCWithoutChecksum;
    if (this.products[index].SSCCWithoutChecksum.length == 18)
      sscc = this.products[index].SSCCWithoutChecksum.slice(0, -1);
    debugger;
    const leadingZeros = this.barcodeHelperService.countLeadingZeros(this.products[index].SSCCWithoutChecksum);

    // Handle using bigint as the number is too large for normal numbers
    let ssccWithoutLeading = BigInt(this.products[index].SSCCWithoutChecksum.slice(leadingZeros));
    ssccWithoutLeading += BigInt(1);
    const dupedProduct = this.products.find(product => product.SSCCWithoutChecksum == `${'0'.repeat(leadingZeros)}${ssccWithoutLeading}`);
    if (dupedProduct) {
      let alert = await this.modalService.open(AlertModalComponent);
      alert.contentInstance.header = "Et produkt med samme SSCC eksisteret allerede";
      alert.contentInstance.body = `EAN: ${dupedProduct.EAN}<br>SSCC: ${dupedProduct.SSCCWithoutChecksum}<br>${dupedProduct.title.replaceAll('\\n', '<br>')}`;
    }

    //Add to history before saving the incremented SSCC
    const copiedProduct = JSON.parse(JSON.stringify(this.products[index]));

    const printedProduct = { 
      product: copiedProduct, 
      printDate: new Date(),
      batchNumber: this._batchNumber,
      bestBefore: this._expirationDate,
      kolli: this._kolli,
      packingSlipId: 0, // ToDo: Implement packing slip
    };
    this.printedProductsService.addPrintedProducts([printedProduct]);

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

    if (this.automaticPrint && value != '' && this._batchNumber != '')
      this.startAutomaticPrint();
  }

  get products(): Product[] {
    if (this.kolliBarcode == '')
      return this.productsService.products;
    return this.productsService.products.filter(product => this.ean.includes(product.EAN));
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
