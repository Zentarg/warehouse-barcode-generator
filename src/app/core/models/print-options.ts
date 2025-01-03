export interface PrintOptions {
    deviceName: string;
    pageWidth: number;
    pageHeight: number;
    SSCC?: string;
    EAN?: string;
    margins: PrintMargins | undefined;
    dpi: number;
    copies: number;
}

export interface PrintMargins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}