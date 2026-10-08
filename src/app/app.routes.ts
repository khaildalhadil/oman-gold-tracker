import { Routes } from '@angular/router';
import { TranslationKey } from './core/i18n/translations';

export interface NavItem {
  path: string;
  label: TranslationKey;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '', label: 'nav.prices' },
  { path: 'calculator', label: 'nav.calculator' },
  { path: 'portfolio', label: 'nav.portfolio' },
  { path: 'alerts', label: 'nav.alerts' },
];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'calculator',
    loadComponent: () => import('./features/calculator/calculator').then((m) => m.Calculator),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio').then((m) => m.Portfolio),
  },
  {
    path: 'alerts',
    loadComponent: () => import('./features/alerts/alerts').then((m) => m.Alerts),
  },
  { path: '**', redirectTo: '' },
];
