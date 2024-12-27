import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./features/nav/nav.component";
import { AsyncPipe, NgIf } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Warehouse Barcodes Generator';
  downloadProgressSubject$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  downloadProgress$: Observable<number> = this.downloadProgressSubject$.asObservable();
  updateInProgressSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  updateInProgress$: Observable<boolean> = this.updateInProgressSubject$.asObservable();
  updateDownloadedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  updateDownloaded$: Observable<boolean> = this.updateDownloadedSubject$.asObservable();
  
  constructor() {
    
  }
  async ngOnInit(): Promise<void> {
    if (window.electronUpdater) {
      window.electronUpdater.onUpdateAvailable(() => {
        this.updateInProgressSubject$.next(true);
        console.log('Update available, starting download...',);
      });
  
      // Listen for download progress
      window.electronUpdater.onDownloadProgress(async (event, progress) => {
        this.downloadProgressSubject$.next(progress.percent);
        console.log(`Download progress: ${Math.round(progress.percent)}%`);
      });
  
      // Listen for update-downloaded event
      window.electronUpdater.onUpdateDownloaded(() => {
        this.updateDownloadedSubject$.next(true);
        console.log('Update downloaded, ready to install.');
      });
    }
  }

  // Method to trigger fake events
  triggerFakeEvents() {
    window.electron.ipcRenderer.send('simulate-update-events');
  }
}
