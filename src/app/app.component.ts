import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./features/nav/nav.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Warehouse Barcodes Generator';
  downloadProgress: number = 0;
  updateInProgress: boolean = false;
  updateDownloaded: boolean = false;
  
  constructor() {
    if (window.electronUpdater) {
      window.electronUpdater.onUpdateAvailable(() => {
        this.updateInProgress = true;
        console.log('Update available, starting download...');
      });
  
      // Listen for download progress
      window.electronUpdater.onDownloadProgress((event, progress) => {
        if (this.updateInProgress) {
          this.downloadProgress = progress.percent;
          console.log(`Download progress: ${this.downloadProgress}%`);
        }
      });
  
      // Listen for update-downloaded event
      window.electronUpdater.onUpdateDownloaded(() => {
        this.updateDownloaded = true;
        console.log('Update downloaded, ready to install.');
      });
    }
    
  }
}
