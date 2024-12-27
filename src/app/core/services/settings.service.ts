import { Injectable } from '@angular/core';
import { Settings } from '../models/settings';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly storageKey = 'settings';
  private _settings: Settings = {} as Settings;

  get settings(): Settings {
    return this._settings;
  }

  constructor() { 
    this.loadSettings();
  }

  private async loadSettings(): Promise<void> {
    let settings;
    if (window.electronStore)
      settings = await window.electronStore.get(this.storageKey);
    else
      settings = localStorage.getItem(this.storageKey);
    if (settings) {
      this._settings = JSON.parse(settings);
    }
  }

  public setSetting(key: keyof Settings, value: any): void {
    this._settings[key] = value;
    this.saveSettings();
  }

  public saveSettings(): void {
    if (window.electronStore)
      window.electronStore.set(this.storageKey, JSON.stringify(this._settings));
    else
      localStorage.setItem(this.storageKey, JSON.stringify(this._settings));
  }
}
