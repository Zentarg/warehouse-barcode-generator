import { Routes } from '@angular/router';
import { BarcodesComponent } from './features/barcodes/barcodes.component';
import { DataComponent } from './features/data/data.component';
import { SettingsComponent } from './features/settings/settings.component';
import { HistoryComponent } from './features/history/history.component';
import { PackingSlipsComponent } from './features/packing-slips/packing-slips.component';
import { PackingSlipComponent } from './features/packing-slips/components/packing-slip/packing-slip.component';

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
        path: 'settings',
        pathMatch: 'full',
        component: SettingsComponent
    },
    {
        path: 'history',
        pathMatch: 'full',
        component: HistoryComponent
    },
    {
        path: 'packingslips',
        pathMatch: 'full',
        component: PackingSlipsComponent
    },
    {
        path: 'packingslips/:id',
        pathMatch: 'full',
        component: PackingSlipComponent
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'barcodes'
    }
];
