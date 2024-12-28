import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalService } from '../../../../core/services/modal.service';
import { Printer } from '../../../../core/models/printer';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-choose-printer-modal',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './choose-printer-modal.component.html',
  styleUrl: './choose-printer-modal.component.scss'
})
export class ChoosePrinterModalComponent implements OnInit {
  @Input() public title: string = 'Vælg printer';
  @Input() public callbackFn: any = () => {};
  callbacking: boolean = false;

  printers: Printer[] = [];
  selectedPrinter: Printer | undefined;


  constructor(private modalService: ModalService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {

    if (window.electron) {
      window.electron.ipcRenderer.on('available-printers', (event, printers) => {
        this.printers = printers as Printer[];
        this.cdr.detectChanges();
      });
    }
    this.getAvailablePrinters();
  }


  getAvailablePrinters() {
    window.electron.ipcRenderer.invoke('get-available-printers');
  }

  async select() {
    this.callbacking = true;
    try {
      await this.callbackFn(this.selectedPrinter);
      this.modalService.closeActiveModal();
    } catch {}
    this.callbacking = false;
  }

  cancel() {
    if (!this.callbacking)
      this.modalService.closeActiveModal();
  }

}
