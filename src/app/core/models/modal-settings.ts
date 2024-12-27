export interface ModalSettings {
    fullscreen?: boolean;
    size?: ModalSize;
    hideCloseButton?: boolean;
}

export enum ModalSize {
    Small = "Small",
    Medium = "Medium",
    Large = "Large"
}