import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Printer } from '../../core/models/printer';
import { NgFor } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';
import { ChoosePrinterModalComponent } from './components/choose-printer-modal/choose-printer-modal.component';
import { SettingsService } from '../../core/services/settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  get labelPrinter(): Printer | undefined {
    return this.settingsService.settings.labelPrinter;
  }
  get deliveryNotePrinter(): Printer | undefined {
    return this.settingsService.settings.deliveryNotePrinter;
  }

  private _automaticPrintTimer: number | undefined;

  constructor(private cdr: ChangeDetectorRef, private modalService: ModalService, private settingsService: SettingsService) {
    
  }

  ngOnInit(): void {
    this.automaticPrintTimer = this.settingsService.settings.automaticPrintTimer;
  }

  async chooseLabelPrinter() {
    let modal = await this.modalService.open(ChoosePrinterModalComponent, {hideCloseButton: false});
    modal.contentInstance.title = 'Vælg label printer';
    modal.contentInstance.callbackFn = async (printer: Printer) => {
      this.settingsService.setSetting('labelPrinter', printer);
    };
  }

  async chooseDeliveryNotePrinter() {
    let modal = await this.modalService.open(ChoosePrinterModalComponent, {hideCloseButton: false});
    modal.contentInstance.title = 'Vælg følgeseddel printer';
    modal.contentInstance.callbackFn = async (printer: Printer) => {
      this.settingsService.setSetting('deliveryNotePrinter', printer);
    };
  }

  async saveAutomaticPrintTimer() {
    this.settingsService.setSetting('automaticPrintTimer', this.automaticPrintTimer);
  }

  get automaticPrintTimer(): number | undefined {
    return this._automaticPrintTimer ?? this.settingsService.settings.automaticPrintTimer;
  }

  set automaticPrintTimer(value: number | undefined) {
    this._automaticPrintTimer = value;
  }

  get isAutomaticPrintTimerSaved(): boolean {
    return this.settingsService.settings.automaticPrintTimer == this.automaticPrintTimer;
  }

}
