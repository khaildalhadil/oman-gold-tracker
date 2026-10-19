import { Injectable, inject, signal } from '@angular/core';
import { KARATS, Karat } from '../gold/gold.constants';
import { LocalStore } from '../storage/local-store';

export interface Holding {
  id: string;
  name: string;
  grams: number;
  karat: Karat;
  /** What was paid in total, in OMR (may include making charges and VAT). */
  cost: number;
  /** ISO date (yyyy-mm-dd). */
  purchasedOn: string;
}

export interface HoldingValuation extends Holding {
  value: number;
  profit: number;
  profitPercent: number;
  pureGrams: number;
}

export interface PortfolioSummary {
  rows: HoldingValuation[];
  totalCost: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
  pureGrams: number;
}

const STORAGE_KEY = 'holdings';

/** Values every holding at the given OMR-per-gram prices and totals the portfolio. */
export function valuePortfolio(
  holdings: Holding[],
  perGram: Record<Karat, number>,
): PortfolioSummary {
  const rows = holdings.map((h) => {
    const value = perGram[h.karat] * h.grams;
    const profit = value - h.cost;
    const fineness = KARATS.find((k) => k.karat === h.karat)!.fineness;
    return {
      ...h,
      value,
      profit,
      profitPercent: h.cost > 0 ? (profit / h.cost) * 100 : 0,
      pureGrams: (h.grams * fineness) / 1000,
    };
  });
  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const profit = totalValue - totalCost;
  return {
    rows,
    totalCost,
    totalValue,
    profit,
    profitPercent: totalCost > 0 ? (profit / totalCost) * 100 : 0,
    pureGrams: rows.reduce((sum, r) => sum + r.pureGrams, 0),
  };
}

function newId(): string {
  return typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** The user's gold pieces, persisted in localStorage on this device. */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly store = inject(LocalStore);
  private readonly _holdings = signal<Holding[]>(this.load());

  readonly holdings = this._holdings.asReadonly();

  add(holding: Omit<Holding, 'id'>): Holding {
    const created = { ...holding, id: newId() };
    this.save([...this._holdings(), created]);
    return created;
  }

  remove(id: string): void {
    this.save(this._holdings().filter((h) => h.id !== id));
  }

  private save(holdings: Holding[]): void {
    this._holdings.set(holdings);
    this.store.set(STORAGE_KEY, holdings);
  }

  private load(): Holding[] {
    const raw = this.store.get<unknown>(STORAGE_KEY, []);
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter(
      (h): h is Holding =>
        typeof h?.id === 'string' &&
        typeof h?.grams === 'number' &&
        typeof h?.cost === 'number' &&
        KARATS.some((k) => k.karat === h?.karat),
    );
  }
}
