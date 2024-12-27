import { Routes } from '@angular/router';
import { BarcodesComponent } from './features/barcodes/barcodes.component';
import { DataComponent } from './features/data/data.component';
import { SettingsComponent } from './features/settings/settings.component';

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
        path: '',
        pathMatch: 'full',
        redirectTo: 'barcodes'
    }
];
