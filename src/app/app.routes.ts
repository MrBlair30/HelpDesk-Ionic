import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'incidents',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'incidents',
    pathMatch: 'full',
  },
  {
    path: 'incidents',
    loadComponent: () => import('./pages/incident-list/incident-list.page').then((m) => m.IncidentListPage),
  },
  {
    path: 'incidents/:id',
    loadComponent: () => import('./pages/incident-detail/incident-detail.page').then((m) => m.IncidentDetailPage),
  },
];
