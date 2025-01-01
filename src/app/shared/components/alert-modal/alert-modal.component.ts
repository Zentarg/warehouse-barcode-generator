import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.scss'
})
export class AlertModalComponent {

  @Input() public header: string = "";
  @Input() public body: string = "";
  @Input() public confirmBtn: string = "Ok";

  constructor(private modalService: ModalService) {}

  close() {
    this.modalService.closeActiveModal();
  }

}
