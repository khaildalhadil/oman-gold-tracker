import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { AlertDirection, AlertsStore } from '../../core/alerts/alerts-store';
import { KARATS, Karat } from '../../core/gold/gold.constants';
import { I18N_PIPES } from '../../core/i18n/i18n-pipes';
import { TranslationKey } from '../../core/i18n/translations';
import { GoldPriceStore } from '../../core/prices/gold-price-store';

const PERMISSION_TEXT: Record<NotificationPermission | 'unsupported', TranslationKey> = {
  default: 'alerts.permission.default',
  granted: 'alerts.permission.granted',
  denied: 'alerts.permission.denied',
  unsupported: 'alerts.permission.unsupported',
};

@Component({
  selector: 'app-alerts',
  imports: [ReactiveFormsModule, ...I18N_PIPES],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class Alerts {
  private readonly prices = inject(GoldPriceStore);
  protected readonly store = inject(AlertsStore);

  protected readonly karats = KARATS;
  protected readonly directions: AlertDirection[] = ['above', 'below'];
  protected readonly permissionText = computed(() => PERMISSION_TEXT[this.store.permission()]);

  protected readonly form = inject(NonNullableFormBuilder).group({
    karat: [21 as Karat],
    direction: ['above' as AlertDirection],
    target: [null as number | null, [Validators.required, Validators.min(0.001)]],
  });

  private readonly karat = toSignal(
    this.form.controls.karat.valueChanges.pipe(map(() => this.form.controls.karat.value)),
    { initialValue: this.form.controls.karat.value },
  );

  protected readonly currentPrice = computed(() => this.prices.price(this.karat()));

  /** Alerts with the current price of their karat, newest first. */
  protected readonly rows = computed(() =>
    [...this.store.alerts()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((alert) => ({ ...alert, current: this.prices.price(alert.karat) })),
  );

  protected useCurrentPrice(): void {
    const price = this.currentPrice();
    if (price != null) {
      this.form.controls.target.setValue(Math.round(price * 1000) / 1000);
    }
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { karat, direction, target } = this.form.getRawValue();
    this.store.add({ karat, direction, target: target! });
    this.form.reset({ karat, direction });
    // A new alert may already be satisfied by the current price.
    const quote = this.prices.quote();
    if (quote && this.prices.status() === 'ok') {
      this.store.check(quote.perGram);
    }
  }
}
