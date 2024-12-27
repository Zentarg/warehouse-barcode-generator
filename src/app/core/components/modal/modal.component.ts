import { Component, ComponentRef, EventEmitter, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { ModalSettings } from '../../models/modal-settings';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() closeModalWithResult = new EventEmitter<any>();
  @ViewChild('modalContent', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;

  public modalSettings?: ModalSettings;

  constructor() {}

  close(result?: any) {
    if (result) {
      this.closeModalWithResult.emit(result);
    } else {
      this.closeModal.emit();
    }
  }

  loadContent<T>(component: Type<T>): ComponentRef<T> {
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(component);
    return componentRef;
  }
}
