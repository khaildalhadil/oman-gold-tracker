import { Routes } from '@angular/router';
import { TranslationKey } from './core/i18n/translations';

export interface NavItem {
  path: string;
  label: TranslationKey;
}

export const NAV_ITEMS: NavItem[] = [];

export const routes: Routes = [];
