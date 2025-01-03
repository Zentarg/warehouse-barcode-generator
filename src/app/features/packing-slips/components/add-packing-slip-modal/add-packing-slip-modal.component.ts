import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalService } from '../../../../core/services/modal.service';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../../../../shared/components/alert-modal/alert-modal.component';
import { PackingSlip, PackingSlipKeyToLabel } from '../../../../core/models/packing-slip';

@Component({
  selector: 'app-add-packing-slip-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-packing-slip-modal.component.html',
  styleUrl: './add-packing-slip-modal.component.scss'
})
export class AddPackingSlipModal implements OnInit{

  @Input() packingSlip!: PackingSlip;
  @Input() header: string = "Tilføj Følgeseddel";
  @Input() public confirmBtn: string = "Opret";
  @Input() public cancelBtn: string = "Annuller";
  @Input() public callbackFn: any = () => {};
  callbacking: boolean = false;

  tempPackingSlip!: PackingSlip;

  constructor(private modalService: ModalService) {}
  ngOnInit(): void {
    this.tempPackingSlip = JSON.parse(JSON.stringify(this.packingSlip));
  }

  async save() {
    this.callbacking = true;
    try {      
      await this.callbackFn(this.tempPackingSlip);
      this.modalService.closeActiveModal();
    } catch {}
    this.callbacking = false;
  }

  cancel() {
    if (!this.callbacking)
      this.modalService.closeActiveModal();
  }

  PackingSlipKeyToLabel(key: keyof PackingSlip): string {
    return PackingSlipKeyToLabel(key);
  }


}
