import { Printer } from "./printer";

export interface Settings {
    labelPrinter: Printer | undefined;
    packingSlipPrinter: Printer | undefined;
    automaticPrintTimer: number | undefined;
}