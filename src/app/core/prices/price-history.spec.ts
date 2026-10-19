import { TestBed } from '@angular/core/testing';
import { PriceQuote } from './gold-api';
import { MIN_POINT_INTERVAL_MS, PriceHistory } from './price-history';

const quote = (updatedAt: number, omr: number): PriceQuote => ({
  updatedAt,
  perGram: { 24: omr, 22: 0, 21: 0, 18: 0 },
});

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
    history.record(quote(start, 4000));
    expect(history.points()).toEqual([{ t: start, omr: 4000 }]);
    expect(JSON.parse(localStorage.getItem('omanGoldTracker.history')!)).toHaveLength(1);
  });

  it('skips quotes that arrive within the minimum interval', () => {
    history.record(quote(start, 4000));
    history.record(quote(start + MIN_POINT_INTERVAL_MS - 1, 4001));
    history.record(quote(start + MIN_POINT_INTERVAL_MS, 4002));
    expect(history.points().map((p) => p.omr)).toEqual([4000, 4002]);
  });

  it('filters points by time', () => {
    history.record(quote(start, 4000));
    history.record(quote(start + 2 * HOUR, 4010));
    expect(history.since(start + HOUR)).toEqual([{ t: start + 2 * HOUR, omr: 4010 }]);
  });

  it('uses the newest point at least a day old as the baseline', () => {
    history.record(quote(start, 4000));
    history.record(quote(start + 2 * HOUR, 4010));
    history.record(quote(start + 30 * HOUR, 4050));
    expect(history.baseline(start + 30 * HOUR)?.omr).toBe(4010);
  });

  it('falls back to the oldest point when history is shorter than a day', () => {
    history.record(quote(start, 4000));
    history.record(quote(start + HOUR, 4010));
    expect(history.baseline(start + HOUR)?.omr).toBe(4000);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem('omanGoldTracker.history', '[{"t":"x"},{"t":5,"omr":4000}]');
    TestBed.resetTestingModule();
    const fresh = TestBed.inject(PriceHistory);
    expect(fresh.points()).toEqual([{ t: 5, omr: 4000 }]);
  });

  it('clears history', () => {
    history.record(quote(start, 4000));
    history.clear();
    expect(history.points()).toEqual([]);
    expect(localStorage.getItem('omanGoldTracker.history')).toBeNull();
  });
});
