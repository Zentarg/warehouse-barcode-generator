import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackingSlipsService } from '../../../../core/services/packing-slips.service';
import { PrintedProductsService } from '../../../../core/services/printed-products.service';
import { PackingSlip } from '../../../../core/models/packing-slip';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { PrintedProduct } from '../../../../core/models/printed-product';
import { BarcodeHelperService } from '../../../../core/services/barcode-helper.service';
import { PrintOptions } from '../../../../core/models/print-options';
import { ToastService } from '../../../../core/services/toast.service';
import { ToastType } from '../../../../core/models/toast-settings';
import { SettingsService } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-packing-slip',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  templateUrl: './packing-slip.component.html',
  styleUrl: './packing-slip.component.scss'
})
export class PackingSlipComponent implements OnInit {
  id: number | null = null;
  idMinLength: number = 5;

  ssccSearch: string = '';
  _canEdit: boolean = false;

  _selectedPrintedProduct: PrintedProduct | undefined = undefined;

  get packingSlip(): PackingSlip {
    return this.packingSlipsService.packingSlips.find(packingSlip => packingSlip.id === this.id)!;
  }

  get availablePrintedProducts() {
    return this.printedProductsService.printedProducts.filter((printedProduct) => {
      const ssccWithChecksum = printedProduct.product.SSCCWithoutChecksum + this.barcodeHelperService.calculateGS1128CheckDigit(printedProduct.product.SSCCWithoutChecksum);
      let inSearch = ssccWithChecksum.includes(this.ssccSearch);
      if (!this.ssccSearch)
        inSearch = true;
      const alreadyAdded = this.packingSlipsService.packingSlips?.some(packingSlip => packingSlip.printedProducts?.some(p => p.product.SSCCWithoutChecksum === printedProduct.product.SSCCWithoutChecksum));
      return inSearch && !alreadyAdded;
    });
  }

  constructor(private route: ActivatedRoute, private router: Router, private packingSlipsService: PackingSlipsService, private printedProductsService: PrintedProductsService, public barcodeHelperService: BarcodeHelperService, private toastService: ToastService, private settingsService: SettingsService) {
  }

  ngOnDestroy(): void {
    if (window.electron) {
      window.electron.ipcRenderer.removeAllListeners('print-started');
      window.electron.ipcRenderer.removeAllListeners('print-failed');
    }
  }

  ngOnInit(): void {
    if (!this.route.snapshot.paramMap.get('id'))
      this.router.navigate(['/packingslips']);
    this.id = +this.route.snapshot.paramMap.get('id')!;

    if (window.electron) {
      window.electron.ipcRenderer.on('print-started', this.handlePrintStarted.bind(this));
      window.electron.ipcRenderer.on('print-failed', this.handlePrintFailed.bind(this));
    }
  }
  
  handlePrintStarted(event: any, options: PrintOptions) {
    this.afterPrint();
    console.log(`Print packingslip started: ${this.packingSlip.title} | ${this.packingSlip.address} | Ordre nr.: ${this.packingSlip.orderNumber}`);
    this.toastService.showToast({
      text: `Printer følgeseddel:<br>${this.packingSlip.title}<br>${this.packingSlip.address}<br>Ordre nr.: ${this.packingSlip.orderNumber}`,
      showCloseButton: false,
      type: ToastType.success,
      duration: 5000,
    });
  }

  async handlePrintFailed(event: any, error: any) {
    console.log(`Print failed: ${error.errorType}`);
    this.toastService.showToast({
      text: `Print af følgeseddel fejlede:<br>${error.errorType}`,
      showCloseButton: true,
      type: ToastType.error,
    });
  }

  afterPrint() {
    this.packingSlip.datePrinted = new Date();
    this.updatePackingSlip();
  }
  
  addSelectedPrintedProduct() {
    if (!this.packingSlip.printedProducts)
      this.packingSlip.printedProducts = [];
    this.packingSlip.printedProducts.push(this.selectedPrintedProduct!);
    this.selectedPrintedProduct!.packingSlipId = this.packingSlip.id;
    this.printedProductsService.updatePrintedProduct([this.selectedPrintedProduct!]);
    this.updatePackingSlip();
    this.selectedPrintedProduct = this.availablePrintedProducts?.length > 0 ? this.availablePrintedProducts[0] : undefined;
    this.calculatePalletDeliveredCount();
  }

  removePrintedProduct(printedProduct: PrintedProduct) {
    this.packingSlip.printedProducts = this.packingSlip.printedProducts?.filter(p => p.product.SSCCWithoutChecksum !== printedProduct.product.SSCCWithoutChecksum);
    printedProduct.packingSlipId = undefined;
    this.printedProductsService.updatePrintedProduct([printedProduct]);
    this.updatePackingSlip();
    this.calculatePalletDeliveredCount();
  }
  // Will be used in packing slip
  getIdenticalPrints(ean: string, kolli: number, bestBefore: string): number {
    return this.printedProductsService.printedProducts.filter(printedProduct => {
      return printedProduct.product.EAN === ean && printedProduct.kolli === kolli && printedProduct.bestBefore == bestBefore;
    }).length;
  };

  print() {

    if (window.electron) {
      const dpi = 96;
        const cmToPixels = (cm: number) => Math.round(cm * dpi / 2.54);
        const cmToMicrons = (cm: number) => cm * 10000;

        const printOptions: PrintOptions = {
          deviceName: this.settingsService.settings.packingSlipPrinter?.name ?? '',
          pageWidth: cmToMicrons(21),
          pageHeight: cmToMicrons(29.7),
          dpi: dpi,
          copies: 4,
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

  private updatePackingSlip() {
    this.packingSlipsService.updatePackingSlip(this.packingSlip);
  }

  private calculatePalletDeliveredCount() {
    let combined = this.combinedPrintedProducts.map(combined => combined.quantity).reduce((acc, quantity) => acc + quantity, 0);
    this.deliveredPalletCount = combined;
  }

  get selectedPrintedProduct(): PrintedProduct | undefined {
    return this._selectedPrintedProduct;
  }

  set selectedPrintedProduct(value: PrintedProduct | undefined) {
    this._selectedPrintedProduct = value;
  }

  get title(): string {
    return this.packingSlip.title;
  }

  set title(value: string) {
    this.packingSlip.title = value;
    this.updatePackingSlip();
  }

  get address(): string {
    return this.packingSlip.address;
  }

  set address(value: string) {
    this.packingSlip.address = value;
    this.updatePackingSlip();
  }

  get orderNumber(): string {
    return this.packingSlip.orderNumber;
  }

  set orderNumber(value: string) {
    this.packingSlip.orderNumber = value;
    this.updatePackingSlip();
  }

  get deliveryDate(): Date {
    return this.packingSlip.deliveryDate;
  }

  set deliveryDate(value: Date) {
    this.packingSlip.deliveryDate = value;
    this.updatePackingSlip();
  }

  get deliveredPalletCount(): number {
    return this.packingSlip.deliveredPalletCount;
  }

  set deliveredPalletCount(value: number) {
    this.packingSlip.deliveredPalletCount = value;
    this.updatePackingSlip();
  }

  get deliveredQuarterPalletCount(): number {
    return this.packingSlip.deliveredQuarterPalletCount;
  }

  set deliveredQuarterPalletCount(value: number) {
    this.packingSlip.deliveredQuarterPalletCount = value;
    this.updatePackingSlip();
  }

  get prefixedId(): string {
    const numLength = this.packingSlip.id.toString().length;
    let repeatCount = this.idMinLength - numLength;
    if (repeatCount < 0)
      repeatCount = 0;
    return '0'.repeat(repeatCount) + this.packingSlip.id;
  }

  get combinedPrintedProducts(): {printedProduct: PrintedProduct, quantity: number}[] {
    const combinedProductsMap = new Map<string, {printedProduct: PrintedProduct, quantity: number}>();

    this.packingSlip.printedProducts?.forEach(product => {
      const key = `${product.product.EAN}-${product.kolli}-${product.bestBefore}`;
      if (combinedProductsMap.has(key)) {
        combinedProductsMap.get(key)!.quantity++;
      } else {
        combinedProductsMap.set(key, { quantity: 1, printedProduct: JSON.parse(JSON.stringify(product)) });
      }
    });

    return Array.from(combinedProductsMap.values());
  }

  get canEdit(): boolean {
    if (this.packingSlip.datePrinted == undefined)
      return true;
    else 
      return this._canEdit;
  }

  set canEdit(value: boolean) {
    this._canEdit = value;
  }




}
