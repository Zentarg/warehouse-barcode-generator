import { Printer } from "./printer";

export interface Settings {
    labelPrinter: Printer | undefined;
    deliveryNotePrinter: Printer | undefined;
}