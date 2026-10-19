import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { KARATS, Karat } from '../gold/gold.constants';

/** The ASP.NET Core backend in /backend (see README). */
export const API_BASE_URL = 'http://localhost:5286';
export const GOLD_PRICES_URL = `${API_BASE_URL}/api/goldprices`;

/** Price of every karat in OMR per gram. */
export interface PriceQuote {
  perGram: Record<Karat, number>;
  /** Epoch milliseconds of the backend's last update. */
  updatedAt: number;
}

interface GoldPriceDto {
  karat: number;
  pricePerGram: number;
  currency: string;
  updatedAt: string;
}

/** Client for the Gold Price Tracker API. */
@Injectable({ providedIn: 'root' })
export class GoldApi {
  private readonly http = inject(HttpClient);

  fetchPrices(): Observable<PriceQuote> {
    return this.http.get<GoldPriceDto[]>(GOLD_PRICES_URL).pipe(map(toQuote));
  }
}

function toQuote(rows: GoldPriceDto[]): PriceQuote {
  const perGram = {} as Record<Karat, number>;
  for (const { karat } of KARATS) {
    const price = Number(rows?.find((r) => r.karat === karat)?.pricePerGram);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Gold API returned no valid price for ${karat}K`);
    }
    perGram[karat] = price;
  }
  const updatedAt = Date.parse(rows[0]?.updatedAt);
  return { perGram, updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now() };
}
