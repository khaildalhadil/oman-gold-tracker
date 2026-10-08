import { DOCUMENT, DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap, filter, fromEvent, merge, tap, timer } from 'rxjs';
import { percentChange } from '../gold/gold-math';
import { LocalStore } from '../storage/local-store';
import { GoldApi, SpotQuote } from './gold-api';
import { PriceHistory } from './price-history';

export const REFRESH_INTERVAL_MS = 60 * 1000;
const LAST_QUOTE_KEY = 'lastQuote';

export type PriceStatus = 'idle' | 'loading' | 'ok' | 'error';

/** Live spot gold price, refreshed every minute and while the tab is visible. */
@Injectable({ providedIn: 'root' })
export class GoldPriceStore {
  private readonly api = inject(GoldApi);
  private readonly history = inject(PriceHistory);
  private readonly store = inject(LocalStore);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refresh$ = new Subject<void>();
  private started = false;

  /** Last known quote; restored from storage so the page is never blank. */
  readonly quote = signal<SpotQuote | null>(this.store.get<SpotQuote | null>(LAST_QUOTE_KEY, null));
  readonly status = signal<PriceStatus>('idle');
  readonly lastCheckedAt = signal<number | null>(null);

  readonly usdPerOunce = computed(() => this.quote()?.usdPerOunce ?? null);

  /** Change against the price ~24h ago (or the oldest point we have). */
  readonly change = computed(() => {
    const quote = this.quote();
    const base = quote ? this.history.baseline(quote.updatedAt) : null;
    if (!quote || !base || base.t >= quote.updatedAt) {
      return null;
    }
    return {
      percent: percentChange(base.usd, quote.usdPerOunce),
      since: base.t,
    };
  });

  /** Starts polling. Safe to call more than once. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    const becameVisible$ = fromEvent(this.document, 'visibilitychange').pipe(
      filter(() => this.document.visibilityState === 'visible'),
    );
    const tick$ = timer(0, REFRESH_INTERVAL_MS).pipe(
      filter(() => this.document.visibilityState !== 'hidden'),
    );

    merge(tick$, becameVisible$, this.refresh$)
      .pipe(
        exhaustMap(() => this.load()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  refresh(): void {
    this.refresh$.next();
  }

  private load() {
    this.status.set('loading');
    return this.api.fetchSpot().pipe(
      tap((quote) => {
        this.quote.set(quote);
        this.status.set('ok');
        this.lastCheckedAt.set(Date.now());
        this.history.record(quote);
        this.store.set(LAST_QUOTE_KEY, quote);
      }),
      catchError(() => {
        this.status.set('error');
        this.lastCheckedAt.set(Date.now());
        return EMPTY;
      }),
    );
  }
}
