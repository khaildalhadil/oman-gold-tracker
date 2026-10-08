import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18n } from './core/i18n/i18n';
import { TranslatePipe } from './core/i18n/i18n-pipes';
import { GoldPriceStore } from './core/prices/gold-price-store';
import { NAV_ITEMS } from './app.routes';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly i18n = inject(I18n);
  protected readonly nav = NAV_ITEMS;

  constructor() {
    inject(GoldPriceStore).start();
  }
}
