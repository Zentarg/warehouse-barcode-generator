import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintersService {
  private readonly storageKey = 'printer';

  constructor() { }

  public getAvailablePrinters(): string[] {
    return [];
  };

  public async getDefaultPrinter(): Promise<string> {
    let printer;
    if (window.electronStore)
      printer = await window.electronStore.get(this.storageKey);
    else
      printer = localStorage.getItem(this.storageKey);
    return Promise.resolve(JSON.parse(printer));
  }

  public async setDefaultPrinter(printer: string): Promise<void> {
    if (window.electronStore)
      await window.electronStore.set(this.storageKey, JSON.stringify(printer));
    else
      localStorage.setItem(this.storageKey, JSON.stringify(printer));
  }
}
