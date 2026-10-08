import { Routes } from '@angular/router';
import { TranslationKey } from './core/i18n/translations';

export interface NavItem {
  path: string;
  label: TranslationKey;
}

export const NAV_ITEMS: NavItem[] = [{ path: '', label: 'nav.prices' }];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '**', redirectTo: '' },
];
