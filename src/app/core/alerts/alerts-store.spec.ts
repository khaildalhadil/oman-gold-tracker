import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PriceQuote } from '../prices/gold-api';
import { GoldPriceStore, PriceStatus } from '../prices/gold-price-store';
import { Toasts } from '../toasts/toasts';
import { AlertsStore, PriceAlert, isAlertHit } from './alerts-store';

describe('isAlertHit', () => {
  const alert = (direction: 'above' | 'below'): PriceAlert => ({
    id: '1',
    karat: 24,
    direction,
    target: 50,
    createdAt: 0,
  });

  it('fires "above" alerts at or over the target', () => {
    expect(isAlertHit(alert('above'), 50)).toBe(true);
    expect(isAlertHit(alert('above'), 49.99)).toBe(false);
  });

  it('fires "below" alerts at or under the target', () => {
    expect(isAlertHit(alert('below'), 50)).toBe(true);
    expect(isAlertHit(alert('below'), 50.01)).toBe(false);
  });
});

describe('AlertsStore', () => {
  const perGram = { 24: 50.95, 22: 46.72, 21: 44.63, 18: 38.25 };
  const quote = signal<PriceQuote | null>(null);
  const status = signal<PriceStatus>('idle');
  let alerts: AlertsStore;
  let toasts: Toasts;

  beforeEach(() => {
    localStorage.clear();
    quote.set(null);
    status.set('idle');
    TestBed.configureTestingModule({
      providers: [{ provide: GoldPriceStore, useValue: { quote, status } }],
    });
    alerts = TestBed.inject(AlertsStore);
    toasts = TestBed.inject(Toasts);
  });

  it('triggers matching alerts once and notifies', () => {
    const price = perGram[22];
    alerts.add({ karat: 22, direction: 'above', target: price - 1 });
    alerts.add({ karat: 22, direction: 'below', target: price - 1 });

    alerts.check(perGram);
    alerts.check(perGram);

    const [above, below] = alerts.alerts();
    expect(above.triggeredAt).toBeTypeOf('number');
    expect(below.triggeredAt).toBeUndefined();
    expect(toasts.items()).toHaveLength(1);
  });

  it('re-arms and removes alerts', () => {
    alerts.add({ karat: 24, direction: 'above', target: 1 });
    alerts.check(perGram);
    const [alert] = alerts.alerts();

    alerts.rearm(alert.id);
    expect(alerts.alerts()[0].triggeredAt).toBeUndefined();

    alerts.remove(alert.id);
    expect(alerts.alerts()).toEqual([]);
    expect(JSON.parse(localStorage.getItem('omanGoldTracker.alerts')!)).toEqual([]);
  });

  it('checks only live quotes once started', () => {
    alerts.add({ karat: 24, direction: 'above', target: 1 });
    alerts.start();

    quote.set({ perGram, updatedAt: 1 });
    TestBed.tick();
    expect(alerts.alerts()[0].triggeredAt).toBeUndefined();

    status.set('ok');
    TestBed.tick();
    expect(alerts.alerts()[0].triggeredAt).toBeTypeOf('number');
  });
});
