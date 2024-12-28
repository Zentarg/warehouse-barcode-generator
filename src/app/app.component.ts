import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavComponent } from "./features/nav/nav.component";
import { AsyncPipe, NgIf } from '@angular/common';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { ToastComponent } from "./core/components/toast/toast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, NgIf, AsyncPipe, ToastComponent],
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

  private pageStyle: HTMLStyleElement;
  
  constructor(private router: Router) {
    this.pageStyle = document.createElement('style');
    document.head.appendChild(this.pageStyle);
    
  }
  async ngOnInit(): Promise<void> {


    if (window.electronUpdater) {
      window.electronUpdater.onUpdateAvailable(() => {
        this.updateInProgressSubject$.next(true);
        console.log('Update available, starting download...',);
      });
  
      // Listen for download progress
      window.electronUpdater.onDownloadProgress(async (event, progress) => {
        this.downloadProgressSubject$.next(Math.round(progress.percent));
        console.log(`Download progress: ${Math.round(progress.percent)}%`);
      });
  
      // Listen for update-downloaded event
      window.electronUpdater.onUpdateDownloaded(() => {
        this.updateDownloadedSubject$.next(true);
        console.log('Update downloaded, ready to install.');
      });
    }

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      switch(event.urlAfterRedirects) {
        case '/barcodes':
          this.setPageStyle('10cm 15cm', '.5cm');
          break;
        case '/data':
        case '/settings':
        case '/packing-slip':
          this.setPageStyle('auto', 'auto');
          break;
      }
    });
  }

  setPageStyle(size: string, margin: string) {
    this.pageStyle.innerHTML = 
    `@page {
      size: ${size};
      margin: ${margin};
    }`;
  }

  // Method to trigger fake events
  triggerFakeEvents() {
    window.electron.ipcRenderer.send('simulate-update-events');
  }
}
