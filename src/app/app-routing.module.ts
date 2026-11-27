import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'master',
    loadComponent: () => import('./pages/master/master.component').then(m => m.MasterComponent),
  },
  {
    path: 'player/:teamId',
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
