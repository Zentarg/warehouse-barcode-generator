import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationLink } from '../../core/models/navigation-link';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {

  navLinks: NavigationLink[] = [

    {
      label: 'Barkoder',
      route: '/barcodes',
      icon: 'bi bi-upc'
    },
    {
      label: 'Data',
      route: '/data',
      icon: 'bi bi-file-earmark-spreadsheet'
    },
    {
      label: 'Følgesedler',
      route: '/packingslips',
      icon: 'bi bi-box-seam'
    },
    {
      label: 'Historik',
      route: '/history',
      icon: 'bi bi-clock-history'
    },
  ]

  bottomNavLinks: NavigationLink[] = [
    {
      label: 'Indstillinger',
      route: '/settings',
      icon: 'bi bi-gear'
    },
  ]

}
