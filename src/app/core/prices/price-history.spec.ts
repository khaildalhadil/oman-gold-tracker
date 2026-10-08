import { TestBed } from '@angular/core/testing';
import { MIN_POINT_INTERVAL_MS, PriceHistory } from './price-history';

describe('PriceHistory', () => {
  const HOUR = 60 * 60 * 1000;
  const start = Date.UTC(2026, 9, 8, 8, 0);
  let history: PriceHistory;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    history = TestBed.inject(PriceHistory);
  });

  it('records quotes and persists them', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    expect(history.points()).toEqual([{ t: start, usd: 4000 }]);
    expect(JSON.parse(localStorage.getItem('omanGoldTracker.history')!)).toHaveLength(1);
  });

  it('skips quotes that arrive within the minimum interval', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    history.record({ updatedAt: start + MIN_POINT_INTERVAL_MS - 1, usdPerOunce: 4001 });
    history.record({ updatedAt: start + MIN_POINT_INTERVAL_MS, usdPerOunce: 4002 });
    expect(history.points().map((p) => p.usd)).toEqual([4000, 4002]);
  });

  it('filters points by time', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    history.record({ updatedAt: start + 2 * HOUR, usdPerOunce: 4010 });
    expect(history.since(start + HOUR)).toEqual([{ t: start + 2 * HOUR, usd: 4010 }]);
  });

  it('uses the newest point at least a day old as the baseline', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    history.record({ updatedAt: start + 2 * HOUR, usdPerOunce: 4010 });
    history.record({ updatedAt: start + 30 * HOUR, usdPerOunce: 4050 });
    expect(history.baseline(start + 30 * HOUR)?.usd).toBe(4010);
  });

  it('falls back to the oldest point when history is shorter than a day', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    history.record({ updatedAt: start + HOUR, usdPerOunce: 4010 });
    expect(history.baseline(start + HOUR)?.usd).toBe(4000);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem('omanGoldTracker.history', '[{"t":"x"},{"t":5,"usd":4000}]');
    TestBed.resetTestingModule();
    const fresh = TestBed.inject(PriceHistory);
    expect(fresh.points()).toEqual([{ t: 5, usd: 4000 }]);
  });

  it('clears history', () => {
    history.record({ updatedAt: start, usdPerOunce: 4000 });
    history.clear();
    expect(history.points()).toEqual([]);
    expect(localStorage.getItem('omanGoldTracker.history')).toBeNull();
  });
});
