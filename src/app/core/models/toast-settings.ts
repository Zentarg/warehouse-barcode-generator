export interface ToastSettings {
    id?: number;
    text: string;
    duration?: number;
    showCloseButton: boolean;
    type: ToastType;
}

export enum ToastType {
    success = 'success',
    error = 'error',
    warning = 'warning',
    info = 'info'
}