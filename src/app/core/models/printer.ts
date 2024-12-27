export interface Printer {
    name: string;
    displayName: string;
    description: string;
    status: number;
    isDefault: boolean;
    options: {
      copies: number;
      collate: boolean;
      color: boolean;
      duplex: boolean;
      orientation: string;
      mediaSize: string;
      mediaType: string;
      resolution: string;
    };
  }