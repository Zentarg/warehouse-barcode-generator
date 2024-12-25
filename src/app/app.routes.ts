import { Routes } from '@angular/router';
import { BarcodesComponent } from './features/barcodes/barcodes.component';
import { DataComponent } from './features/data/data.component';

export const routes: Routes = [
    {
        path: 'data',
        pathMatch: 'full',
        component: DataComponent
    },
    {
        path: 'barcodes',
        pathMatch: 'full',
        component: BarcodesComponent
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'barcodes'
    }
];
