
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
import { PackingSlipsService } from '../../core/services/packing-slips.service';
import { PackingSlip } from '../../core/models/packing-slip';
import { AddPackingSlipModal } from '../packing-slips/components/add-packing-slip-modal/add-packing-slip-modal.component';
import { ModalSize } from '../../core/models/modal-settings';
import { SpinnerComponent } from "../../shared/components/spinner/spinner.component";
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, SpinnerComponent],
  templateUrl: './barcodes.component.html',
  styleUrl: './barcodes.component.scss'
})
export class BarcodesComponent implements OnInit, OnDestroy {
  _kolliBarcode: string = '';
  _selectedProduct: Product | undefined;
  _selectedPackingSlip: PackingSlip | undefined;

  ean: string = '';
  _batchNumber: string = '';
  _expirationDate: string = '';
  _kolli: number = 0;
  _automaticPrint: boolean = false;
  _isPrinting: boolean = false;
  _automaticPrintCountdown: number = 0;
  automaticPrintCountdownInterval: any;
  _addToPackingSlipOnPrint: boolean = false;
  _loopPrint: boolean = false;
  _loopPrintCount: number = 1;
  _copiesPerLoop: number = 2;
  _isLoopPrinting: boolean = false;
  
  
  _currentLoopPrints$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  _currentLoopPrints: Observable<number> = this._currentLoopPrints$.asObservable();

  constructor(private productsService: ProductsService, public barcodeHelperService: BarcodeHelperService, public settingsService: SettingsService, private cdr: ChangeDetectorRef, private toastService: ToastService, private printedProductsService: PrintedProductsService, private modalService: ModalService, private packingSlipsService: PackingSlipsService) {
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
      text: `Printer:<br>EAN: ${options.EAN}<br>SSCC: ${options.SSCC! + this.barcodeHelperService.calculateGS1128CheckDigit(options.SSCC!)}`,
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
        text: `(02)${!this.selectedProduct.EAN.startsWith('1') && this.selectedProduct.EAN.length == 13 ? '0' : ''}${this.selectedProduct.EAN}(37)${this.kolli}`, // Text to encode
        includetext: true, // Show human-readable text
        textyoffset: 5, // Y offset for human-readable text
        textsize: 8,
        height: 10,
      });
      const ssccWithoutChecksum = this.selectedProduct.SSCCWithoutChecksum;
      const checkDigit = this.barcodeHelperService.calculateGS1128CheckDigit(ssccWithoutChecksum);
      let canvas3 = bwipjs.toCanvas('barcode3', {
        bcid: 'gs1-128', // Barcode type,
        text: `(00)${ssccWithoutChecksum}${checkDigit}`,
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
    this.isPrinting = true;
    if (window.electron) {
      const dpi = 96;
        const cmToPixels = (cm: number) => Math.round(cm * dpi / 2.54);
        const cmToMicrons = (cm: number) => cm * 10000;

        let copies = 2;
        if (this.loopPrint) {
          copies = this.copiesPerLoop;
          if (copies < 1)
            copies = 1;
        }

        const printOptions: PrintOptions = {
          deviceName: this.settingsService.settings.labelPrinter?.name ?? '',
          pageWidth: cmToMicrons(10),
          pageHeight: cmToMicrons(15),
          SSCC: this.selectedProduct!.SSCCWithoutChecksum,
          EAN: this.selectedProduct!.EAN,
          dpi: dpi,
          copies: copies,
          margins: {
            top: cmToPixels(0.5),
            right: cmToPixels(0.5),
            bottom: cmToPixels(0.5),
            left: cmToPixels(0.5)
          }
        }

        let action = "print";
        if (this.settingsService.settings.manualPrintSilent || this.loopPrint)
          action = "print-silent";

        window.electron.ipcRenderer.invoke(action, printOptions);
    } else {
      window.onafterprint = () => {
        this.afterPrint();
      }
      window.print();
    }
  }

  manualPrint(): void {
    if (this.loopPrint) {
      this.printLoop();
    } else {
      this.print();
    }
  }

  printLoop(): void {
    if (!this._loopPrint || this._loopPrintCount <= 0)
      return;

    this.isLoopPrinting = true;
    
    let loopSubscription = this._currentLoopPrints.subscribe((currentLoopPrints) => {
      if (currentLoopPrints >= this._loopPrintCount) {
        this.isPrinting = false;
        loopSubscription.unsubscribe();
        this._currentLoopPrints$.next(0);
        this.isLoopPrinting = false;
        this.kolliBarcode = "";
        this.cdr.detectChanges();
        return;
      }

      if (this.selectedProduct && this.copiesPerLoop > 0) {
        this.print();
      }
    });
  }

  async afterPrint(): Promise<void> {
    const index = this.products.findIndex(product => product.EAN === this.selectedProduct?.EAN);
    if (index == -1)
      return;
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
      packingSlipId: this.addToPackingSlipOnPrint ? this.selectedPackingSlip?.id : undefined, // ToDo: Implement packing slip
    };
    
    if (this.addToPackingSlipOnPrint && this.selectedPackingSlip) {
      if (this.selectedPackingSlip.printedProducts == undefined)
        this.selectedPackingSlip.printedProducts = [];
      this.selectedPackingSlip.printedProducts.push(printedProduct);
      if (this.selectedPackingSlip.deliveredPalletCount == undefined)
        this.selectedPackingSlip.deliveredPalletCount = 0;
      this.selectedPackingSlip.deliveredPalletCount++;
  
      this.packingSlipsService.updatePackingSlip(this.selectedPackingSlip!);
    }

    this.printedProductsService.addPrintedProducts([printedProduct]);

    this.products[index].SSCCWithoutChecksum = `${'0'.repeat(leadingZeros)}${ssccWithoutLeading}`;
    this.productsService.saveProducts();

    
    this.isPrinting = false;
    if (!this.isLoopPrinting) {
      this.kolliBarcode = "";
      this.cdr.detectChanges();
    }
    this._currentLoopPrints$.next(this._currentLoopPrints$.value + 1);
  }

  async addPackingSlip() {
    let modal = await this.modalService.open(AddPackingSlipModal, {
      size: ModalSize.Large,
    })
    modal.contentInstance.packingSlip = {} as PackingSlip;
    modal.contentInstance.callbackFn = (packingSlip: PackingSlip) => {
      this.packingSlipsService.addPackingSlips([packingSlip]);
      this.selectedPackingSlip = packingSlip;
    }

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

    let selectedProduct: Product | undefined = this.products[0];
    if (value == '')
      selectedProduct = undefined;
    this.selectedProduct = selectedProduct;
    this._kolli = this.selectedProduct?.kolli ?? 0;

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
    else
      this.loopPrint = false;
  }

  get isPrinting(): boolean {
    return this._isPrinting;
  }

  set isPrinting(value: boolean) {
    this._isPrinting = value;
  }
  get isLoopPrinting(): boolean {
    return this._isLoopPrinting;
  }

  set isLoopPrinting(value: boolean) {
    this._isLoopPrinting = value;
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

  get packingSlips(): PackingSlip[] {
    return this.packingSlipsService.packingSlips.filter(packingSlip => !packingSlip.datePrinted);
  }

  get selectedPackingSlip(): PackingSlip | undefined {
    return this._selectedPackingSlip;
  };

  set selectedPackingSlip(packingSlip: PackingSlip | undefined) {
    this._selectedPackingSlip = packingSlip;
  };

  get addToPackingSlipOnPrint(): boolean {
    return this._addToPackingSlipOnPrint;
  };

  set addToPackingSlipOnPrint(packingSlip: boolean) {
    this._addToPackingSlipOnPrint = packingSlip;
  };

  get loopPrint(): boolean {
    return this._loopPrint;
  };

  set loopPrint(loopPrint: boolean) {
    this._loopPrint = loopPrint;
    if (loopPrint) {
      this.automaticPrint = false;
    }
  };

  get loopPrintCount(): number {
    return this._loopPrintCount;
  };

  set loopPrintCount(loopPrintCount: number) {
    this._loopPrintCount = loopPrintCount;
  };

  get copiesPerLoop(): number {
    return this._copiesPerLoop;
  };

  set copiesPerLoop(copiesPerLoop: number) {
    this._copiesPerLoop = copiesPerLoop;
  };

}
