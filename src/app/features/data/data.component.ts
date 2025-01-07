import { Component, ElementRef, ViewChild } from '@angular/core';
import { Product } from '../../core/models/product';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { CsvHandlerService } from '../../core/services/csv-handler.service';
import { BarcodeHelperService } from '../../core/services/barcode-helper.service';
import { ModalService } from '../../core/services/modal.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { EditProductModalComponent } from './components/edit-product-modal/edit-product-modal.component';
import { ModalSize } from '../../core/models/modal-settings';
import { ToastService } from '../../core/services/toast.service';
import { ToastType } from '../../core/models/toast-settings';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private productsService: ProductsService, private csvHandlerService: CsvHandlerService, public barcodeHelperService: BarcodeHelperService, private modalService: ModalService, private toastService: ToastService) {
  }

  eanSearch: string = '';
  companySearch: string = '';

  get products() {
    if (this.productsService.products.length === 0) 
      return [];
    return this.productsService.products.filter(product => product.EAN?.includes(this.eanSearch) && product.company?.includes(this.companySearch));
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
        this.productsService.addProducts(this.csvHandlerService.processCSV(text));
      };
      reader.readAsText(file);
    }
  }

  export(): void {
    this.csvHandlerService.exportCSV(this.productsService.products);
  }
  print(): void {
    window.print();
  }

  async removeProduct(product: Product): Promise<void> {
    let modal = await this.modalService.open(ConfirmModalComponent, {});
    modal.contentInstance.header = "Er du sikker på at du vil slette dette produkt?";
    modal.contentInstance.body = `EAN: ${product.EAN}<br>${product.title.replaceAll('\\n', '<br>')}`;
    modal.contentInstance.confirmBtn = "Slet";
    modal.contentInstance.callbackFn = async () => {
      this.productsService.removeProducts([product]);
    };
  }

  async editProduct(product: Product): Promise<void> {
    let modal = await this.modalService.open(EditProductModalComponent, {
      size: ModalSize.Large
    });
    modal.contentInstance.header = `Rediger produkt (EAN: ${product.EAN})`;
    modal.contentInstance.confirmBtn = "Gem";
    modal.contentInstance.product = product;
    modal.contentInstance.validateFn = this.validateProduct.bind(this);
    modal.contentInstance.callbackFn = async (editedProduct: Product) => {
      this.productsService.updateProduct(product.EAN, editedProduct);
    };
  };

  async addProduct(): Promise<void> {
    let modal = await this.modalService.open(EditProductModalComponent, {
      size: ModalSize.Large
    });
    modal.contentInstance.header = "Opret nyt produkt";
    modal.contentInstance.confirmBtn = "Opret";
    modal.contentInstance.product = {
      EAN: "",
      title: "",
      company: "",
      SSCCWithoutChecksum: "",
      productName: "",
      type: ""
    } as Product;
    modal.contentInstance.isAdding = true;
    modal.contentInstance.validateFn = this.validateProduct.bind(this);
    modal.contentInstance.callbackFn = async (product: Product) => {
      this.toastService.showToast({
        text: `Produkt oprettet<br>EAN: ${product.EAN}<br>SSCC: ${product.SSCCWithoutChecksum + this.barcodeHelperService.calculateGS1128CheckDigit(product.SSCCWithoutChecksum)}`,
        type: ToastType.success,
        showCloseButton: true,
        duration: 5000,
      });
      this.productsService.addProducts([product]);
    };
  };

  validateProduct(product: Product, isNewProduct: boolean): { isValid: boolean, error?: string } {
    if (isNewProduct) {
      const existingEAN = this.productsService.products.find(p => p.EAN === product.EAN);
      if (existingEAN) {
        return { isValid: false, error: "Produkt med samme EAN findes allerede" };
      }
    }
    const existingSSCC = this.productsService.products.find(p => p.SSCCWithoutChecksum === product.SSCCWithoutChecksum);

    if (existingSSCC) {
      return { isValid: false, error: `Produkt med samme SSCC findes allerede<br>EAN: ${existingSSCC.EAN}` };
    }

    return { isValid: true };
  }

}
