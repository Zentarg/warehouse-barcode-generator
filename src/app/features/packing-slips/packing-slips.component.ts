import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PackingSlipsService } from '../../core/services/packing-slips.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgFor } from '@angular/common';
import { PackingSlip } from '../../core/models/packing-slip';
import { ModalService } from '../../core/services/modal.service';
import { AddPackingSlipModal } from './components/add-packing-slip-modal/add-packing-slip-modal.component';
import { ModalSize } from '../../core/models/modal-settings';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-packing-slips',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, DatePipe],
  templateUrl: './packing-slips.component.html',
  styleUrl: './packing-slips.component.scss'
})
export class PackingSlipsComponent {

  titleSearch: string = '';
  orderNumberSearch: string = '';

  get packingSlips() {
    if (this.packingSlipsService.packingSlips.length === 0) 
      return [];
    return this.packingSlipsService.packingSlips.filter(packingSlip => packingSlip.title?.includes(this.titleSearch) && packingSlip.orderNumber?.includes(this.orderNumberSearch));
  }

  constructor(private packingSlipsService: PackingSlipsService, private modalService: ModalService, private router: Router) { }

  async addPackingSlip() {
    let modal = await this.modalService.open(AddPackingSlipModal, {
      size: ModalSize.Large,
    })
    modal.contentInstance.packingSlip = {} as PackingSlip;
    modal.contentInstance.callbackFn = (packingSlip: PackingSlip) => {
      this.packingSlipsService.addPackingSlips([packingSlip]);
      this.router.navigate(['/packingslips', packingSlip.id]);
    }
  }

  async removePackingSlip(packingSlip: PackingSlip) {

    let modal = await this.modalService.open(ConfirmModalComponent, {});
    modal.contentInstance.header = "Er du sikker på at du vil slette denne følgeseddel?";
    modal.contentInstance.body = `${packingSlip.title}<br>${packingSlip.address}<br>Ordre nr.: ${packingSlip.orderNumber}<br>Leveringsdato: ${packingSlip.deliveryDate || 'Ikke leveret'}`;
    modal.contentInstance.confirmBtn = "Slet";
    modal.contentInstance.callbackFn = async () => {
      this.packingSlipsService.removePackingSlips([packingSlip]);
    };

  }


}
