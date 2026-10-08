import { Injectable, inject, signal } from '@angular/core';
import { LocalStore } from '../storage/local-store';
import { SpotQuote } from './gold-api';

/** One stored spot price: `t` is epoch ms, `usd` is USD per troy ounce. */
export interface PricePoint {
  t: number;
  usd: number;
}

const STORAGE_KEY = 'history';
/** Keep at most one point per five minutes so storage stays small. */
export const MIN_POINT_INTERVAL_MS = 5 * 60 * 1000;
export const MAX_POINTS = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The free price API has no history endpoint, so the app builds its own
 * history from the quotes it sees and keeps it in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class PriceHistory {
  private readonly store = inject(LocalStore);
  private readonly _points = signal<PricePoint[]>(this.load());

  readonly points = this._points.asReadonly();

  record(quote: SpotQuote): void {
    const points = this._points();
    const last = points.at(-1);
    if (last && quote.updatedAt - last.t < MIN_POINT_INTERVAL_MS) {
      return;
    }
    const next = [...points, { t: quote.updatedAt, usd: quote.usdPerOunce }].slice(-MAX_POINTS);
    this._points.set(next);
    this.store.set(STORAGE_KEY, next);
  }

  /** Points at or after `from` (epoch ms). */
  since(from: number): PricePoint[] {
    return this._points().filter((p) => p.t >= from);
  }

  /**
   * The reference price for a "24h change": the newest point at least a day
   * older than `now`, or the oldest point we have if history is shorter.
   */
  baseline(now: number): PricePoint | null {
    const points = this._points();
    if (points.length === 0) {
      return null;
    }
    const cutoff = now - DAY_MS;
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].t <= cutoff) {
        return points[i];
      }
    }
    return points[0];
  }

  clear(): void {
    this._points.set([]);
    this.store.remove(STORAGE_KEY);
  }

  private load(): PricePoint[] {
    const raw = this.store.get<unknown>(STORAGE_KEY, []);
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .filter(
        (p): p is PricePoint =>
          typeof p?.t === 'number' && typeof p?.usd === 'number' && p.usd > 0,
      )
      .sort((a, b) => a.t - b.t)
      .slice(-MAX_POINTS);
  }
}
