import { Injectable } from '@angular/core';
import { PackingSlip } from '../models/packing-slip';

@Injectable({
  providedIn: 'root'
})
export class PackingSlipsService {
  private nextId = 1;
  private readonly storageKey = 'packing_slips';
  private _packingSlips: PackingSlip[] = [];

  constructor() {
    this.loadPackingSlips();
  }

  get packingSlips(): PackingSlip[] {
    return this._packingSlips;
  }

  addPackingSlips(packingSlips: PackingSlip[]): void {
    packingSlips.forEach(packingSlip => {
      if (!this._packingSlips.find(p => p.id === packingSlip.id)) {
        packingSlip.id = this.nextId++;
        this._packingSlips.push(packingSlip);
      } else {
        const index = this._packingSlips.findIndex(p => p.id === packingSlip.id);
        this._packingSlips[index] = packingSlip;
      }
    });
    this.savePackingSlips();
  }

  removePackingSlips(packingSlips: PackingSlip[]): void {
    this._packingSlips = this._packingSlips.filter(p => !packingSlips.find(packingSlip => packingSlip.id === p.id));
    this.savePackingSlips();
  }

  public savePackingSlips(): void {
    if (window.electronStore)
      window.electronStore.set(this.storageKey, JSON.stringify(this._packingSlips));
    else
      localStorage.setItem(this.storageKey, JSON.stringify(this._packingSlips));
  }

  public updatePackingSlip(packingSlip: PackingSlip): void {
    const index = this._packingSlips.findIndex(p => p.id === packingSlip.id);
    this._packingSlips[index] = packingSlip;
    this.savePackingSlips();
  }

  private async loadPackingSlips(): Promise<void> {
    let packingSlips;
    if (window.electronStore)
      packingSlips = await window.electronStore.get(this.storageKey);
    else
      packingSlips = localStorage.getItem(this.storageKey);
    if (packingSlips) {
      this._packingSlips = JSON.parse(packingSlips);
    }
    let maxId = this._packingSlips ? Math.max(...this._packingSlips.map(p => p.id)) : 0;
  }


}