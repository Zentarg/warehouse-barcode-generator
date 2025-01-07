import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Product, ProductKeyToLabel } from '../../../../core/models/product';
import { ModalService } from '../../../../core/services/modal.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../../../../shared/components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-product-modal.component.html',
  styleUrl: './edit-product-modal.component.scss'
})
export class EditProductModalComponent implements OnInit{

  @Input() product!: Product;
  @Input() header: string = "Rediger produkt";
  @Input() public confirmBtn: string = "Gem";
  @Input() public cancelBtn: string = "Annuller";
  @Input() public callbackFn: any = () => {};
  @Input() public validateFn: any = () => {};
  @Input() public isAdding: boolean = false;
  callbacking: boolean = false;

  tempProduct!: Product;

  constructor(private modalService: ModalService) {}
  ngOnInit(): void {
    this.tempProduct = JSON.parse(JSON.stringify(this.product));
  }


  async save() {
    this.callbacking = true;
    try {
      let validateResult = await this.validateFn(this.tempProduct, this.isAdding);
      if (validateResult && !validateResult.isValid) {
        let alert = await this.modalService.open(AlertModalComponent, {})
        alert.contentInstance.header = "Validerings-fejl";
        alert.contentInstance.body = validateResult.error;
        this.callbacking = false;
        return;
      }
      
      if (this.isAdding) {
        await this.callbackFn(this.tempProduct);
        this.modalService.closeActiveModal();
        this.callbacking = false;
        return;
      }


      let modal = await this.modalService.open(ConfirmModalComponent, {});
      modal.contentInstance.header = `Bekræft af produkt ændring (EAN: ${this.product.EAN})`;

      let bodyTable = `
        <table>
          <thead>
            <tr>
              <th>Kolonne</th>
              <th>Gammel Værdi</th>
              <th>Ny Værdi</th>
            </tr>
          </thead>
          <tbody>
      `;

      Object.keys(this.product).forEach((key) => {
        if (this.product[key as keyof Product] !== this.tempProduct[key as keyof Product]) {
          bodyTable += `
            <tr>
              <td>${ProductKeyToLabel(key as keyof Product)}</td>
              <td>${this.product[key as keyof Product]}</td>
              <td>${this.tempProduct[key as keyof Product]}</td>
            </tr>
          `;
        }
      });

      bodyTable += `
          </tbody>
        </table>
      `;

      modal.contentInstance.body = bodyTable;

      modal.contentInstance.callbackFn = async () => {
        await this.callbackFn(this.tempProduct);
        this.modalService.closeActiveModal();
      }
    } catch {}
    this.callbacking = false;
  }

  cancel() {
    if (!this.callbacking)
      this.modalService.closeActiveModal();
  }

  get canSave() {

    const anyChanges = JSON.stringify(this.product) !== JSON.stringify(this.tempProduct);
    const allRequiredFilled = !!this.tempProduct.EAN && !!this.tempProduct.SSCCWithoutChecksum;

    return allRequiredFilled && anyChanges;
  }

  ProductKeyToLabel(key: keyof Product): string {
    return ProductKeyToLabel(key);
  }


}
