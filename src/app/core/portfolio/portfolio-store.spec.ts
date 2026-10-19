import { TestBed } from '@angular/core/testing';
import { Holding, PortfolioStore, valuePortfolio } from './portfolio-store';

describe('valuePortfolio', () => {
  const perGram = { 24: 50.95, 22: 46.72, 21: 44.63, 18: 38.25 };
  const holdings: Holding[] = [
    { id: 'a', name: 'Ring', grams: 10, karat: 21, cost: 400, purchasedOn: '2026-01-01' },
    { id: 'b', name: 'Bar', grams: 20, karat: 24, cost: 900, purchasedOn: '2026-02-01' },
  ];

  it('values each holding and computes profit', () => {
    const { rows } = valuePortfolio(holdings, perGram);
    const ringValue = 44.63 * 10;
    expect(rows[0].value).toBeCloseTo(ringValue, 6);
    expect(rows[0].profit).toBeCloseTo(ringValue - 400, 6);
    expect(rows[0].profitPercent).toBeCloseTo(((ringValue - 400) / 400) * 100, 6);
    expect(rows[0].pureGrams).toBeCloseTo(8.75, 6);
  });

  it('totals the portfolio', () => {
    const summary = valuePortfolio(holdings, perGram);
    const total = 44.63 * 10 + 50.95 * 20;
    expect(summary.totalCost).toBe(1300);
    expect(summary.totalValue).toBeCloseTo(total, 6);
    expect(summary.profit).toBeCloseTo(total - 1300, 6);
    expect(summary.pureGrams).toBeCloseTo(8.75 + 19.98, 6);
  });

  it('handles an empty portfolio', () => {
    const summary = valuePortfolio([], perGram);
    expect(summary.totalValue).toBe(0);
    expect(summary.profitPercent).toBe(0);
  });
});

describe('PortfolioStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds, persists and removes holdings', () => {
    const store = TestBed.inject(PortfolioStore);
    const added = store.add({
      name: 'Chain',
      grams: 15,
      karat: 22,
      cost: 700,
      purchasedOn: '2026-03-01',
    });
    expect(store.holdings()).toHaveLength(1);
    expect(added.id).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('omanGoldTracker.holdings')!)).toHaveLength(1);

    store.remove(added.id);
    expect(store.holdings()).toEqual([]);
  });

  it('drops invalid stored holdings', () => {
    localStorage.setItem(
      'omanGoldTracker.holdings',
      JSON.stringify([
        { id: 'x', name: 'ok', grams: 1, karat: 18, cost: 30, purchasedOn: '2026-01-01' },
        { id: 'y', name: 'bad karat', grams: 1, karat: 14, cost: 30, purchasedOn: '2026-01-01' },
        { name: 'no id', grams: 1, karat: 18, cost: 30 },
      ]),
    );
    expect(TestBed.inject(PortfolioStore).holdings().map((h) => h.id)).toEqual(['x']);
  });
});
