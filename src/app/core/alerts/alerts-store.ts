import { Injectable, Injector, effect, inject, signal, untracked } from '@angular/core';
import { karatPrice } from '../gold/gold-math';
import { KARATS, Karat } from '../gold/gold.constants';
import { I18n } from '../i18n/i18n';
import { GoldPriceStore } from '../prices/gold-price-store';
import { LocalStore } from '../storage/local-store';
import { Toasts } from '../toasts/toasts';

export type AlertDirection = 'above' | 'below';

export interface PriceAlert {
  id: string;
  karat: Karat;
  direction: AlertDirection;
  /** Target price in OMR per gram. */
  target: number;
  createdAt: number;
  /** Set once the alert has fired; it then stays quiet until re-armed. */
  triggeredAt?: number;
}

const STORAGE_KEY = 'alerts';

export function isAlertHit(alert: PriceAlert, pricePerGram: number): boolean {
  return alert.direction === 'above' ? pricePerGram >= alert.target : pricePerGram <= alert.target;
}

function newId(): string {
  return typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Price alerts per karat. Checked on every fresh quote; a hit shows an
 * in-app toast and, when permitted, a browser notification.
 */
@Injectable({ providedIn: 'root' })
export class AlertsStore {
  private readonly store = inject(LocalStore);
  private readonly prices = inject(GoldPriceStore);
  private readonly toasts = inject(Toasts);
  private readonly i18n = inject(I18n);
  private readonly injector = inject(Injector);

  private readonly _alerts = signal<PriceAlert[]>(this.load());
  private started = false;

  readonly alerts = this._alerts.asReadonly();
  readonly permission = signal<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );

  /** Starts checking alerts whenever a fresh price arrives. Safe to call more than once. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    effect(
      () => {
        const quote = this.prices.quote();
        // Only react to live prices, not the cached quote restored at startup.
        if (quote && this.prices.status() === 'ok') {
          untracked(() => this.check(quote.usdPerOunce));
        }
      },
      { injector: this.injector },
    );
  }

  add(alert: Pick<PriceAlert, 'karat' | 'direction' | 'target'>): void {
    this.save([...this._alerts(), { ...alert, id: newId(), createdAt: Date.now() }]);
  }

  remove(id: string): void {
    this.save(this._alerts().filter((a) => a.id !== id));
  }

  rearm(id: string): void {
    this.save(this._alerts().map((a) => (a.id === id ? { ...a, triggeredAt: undefined } : a)));
  }

  async requestPermission(): Promise<void> {
    if (typeof Notification === 'undefined') {
      return;
    }
    this.permission.set(await Notification.requestPermission());
  }

  /** Fires every armed alert whose condition is met at this spot price. */
  check(usdPerOunce: number): void {
    const now = Date.now();
    let changed = false;
    const next = this._alerts().map((alert) => {
      if (alert.triggeredAt) {
        return alert;
      }
      const price = karatPrice(usdPerOunce, alert.karat);
      if (!isAlertHit(alert, price)) {
        return alert;
      }
      changed = true;
      this.notify(alert, price);
      return { ...alert, triggeredAt: now };
    });
    if (changed) {
      this.save(next);
    }
  }

  private notify(alert: PriceAlert, price: number): void {
    const title = this.i18n.t('alerts.notifyTitle', { k: alert.karat });
    const message = this.i18n.t(
      alert.direction === 'above' ? 'alerts.notifyAbove' : 'alerts.notifyBelow',
      { price: this.i18n.formatOmr(price), target: this.i18n.formatOmr(alert.target) },
    );
    this.toasts.show(title, message);
    if (this.permission() === 'granted') {
      try {
        new Notification(title, { body: message, icon: 'favicon.svg', tag: alert.id });
      } catch {
        // Some browsers (e.g. Android Chrome) only allow notifications from a service worker.
      }
    }
  }

  private save(alerts: PriceAlert[]): void {
    this._alerts.set(alerts);
    this.store.set(STORAGE_KEY, alerts);
  }

  private load(): PriceAlert[] {
    const raw = this.store.get<unknown>(STORAGE_KEY, []);
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter(
      (a): a is PriceAlert =>
        typeof a?.id === 'string' &&
        typeof a?.target === 'number' &&
        (a?.direction === 'above' || a?.direction === 'below') &&
        KARATS.some((k) => k.karat === a?.karat),
    );
  }
}
