import { AfterViewInit, Component, ComponentRef, ElementRef, EventEmitter, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { ModalSettings } from '../../models/modal-settings';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements AfterViewInit{
  @Output() closeModal = new EventEmitter<void>();
  @Output() closeModalWithResult = new EventEmitter<any>();
  @ViewChild('modalContent', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  private previousActiveElement: HTMLElement | null = null;
  public modalSettings?: ModalSettings;

  constructor() {

  }
  ngAfterViewInit(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.modalContainer.nativeElement.focus();
  }

  close(result?: any) {
    if (result) {
      this.closeModalWithResult.emit(result);
    } else {
      this.closeModal.emit();
    }
    this.previousActiveElement?.focus();
  }

  loadContent<T>(component: Type<T>): ComponentRef<T> {
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(component);
    return componentRef;
  }
  
  trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = this.modalContainer.nativeElement.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}
