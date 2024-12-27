import { Component, Input } from '@angular/core';
import { ToastSettings } from '../../models/toast-settings';
import { AsyncPipe, NgFor } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, AsyncPipe],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

  get toasts$(): Observable<ToastSettings[]> {
    return this.toastsService.toasts$;
  }

  constructor(private toastsService: ToastService) { }
  

  removeToast(id: number): void {
    this.toastsService.removeToast(id);
  };
}
