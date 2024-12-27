import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ToastSettings } from '../models/toast-settings';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  private toastsSubject$: BehaviorSubject<ToastSettings[]> = new BehaviorSubject<ToastSettings[]>([]);
  public toasts$ = this.toastsSubject$.asObservable();

  constructor() { }

  public showToast(toast: ToastSettings): void {
    toast.id = this.nextId++;
    let toasts = this.toastsSubject$.getValue();
    toasts.push(toast);
    this.toastsSubject$.next(toasts);
    if (toast.duration) {
      setTimeout(() => this.removeToast(toast.id!), toast.duration);
    }
  };

  public removeToast(id: number): void {
    let toasts = this.toastsSubject$.getValue();
    toasts = toasts.filter(toast => toast.id !== id);
    this.toastsSubject$.next(toasts);
  };


}
