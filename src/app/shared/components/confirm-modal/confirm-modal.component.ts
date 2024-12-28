import { Component, Input } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {

  @Input() public header: string = "Header tekst her";
  @Input() public body: string = "";
  @Input() public confirmBtn: string = "Ja";
  @Input() public cancelBtn: string = "Annuller";
  @Input() public callbackFn: any = () => {};
  callbacking: boolean = false;


  constructor(private modalService: ModalService) {}


  async accept() {
    this.callbacking = true;
    try {
      await this.callbackFn();
      this.modalService.closeActiveModal();
    } catch {}
    this.callbacking = false;
  }

  cancel() {
    if (!this.callbacking)
      this.modalService.closeActiveModal();
  }



}
