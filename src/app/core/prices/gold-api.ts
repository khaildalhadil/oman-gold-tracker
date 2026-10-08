import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export const GOLD_API_URL = 'https://api.gold-api.com/price/XAU';

/** Spot gold quote in USD per troy ounce. */
export interface SpotQuote {
  usdPerOunce: number;
  /** Epoch milliseconds of the provider's last update. */
  updatedAt: number;
}

interface GoldApiResponse {
  price: number;
  updatedAt: string;
}

/** Client for gold-api.com: free, keyless and CORS-enabled. */
@Injectable({ providedIn: 'root' })
export class GoldApi {
  private readonly http = inject(HttpClient);

  fetchSpot(): Observable<SpotQuote> {
    return this.http.get<GoldApiResponse>(GOLD_API_URL).pipe(
      map((res) => {
        const usdPerOunce = Number(res?.price);
        const updatedAt = Date.parse(res?.updatedAt);
        if (!Number.isFinite(usdPerOunce) || usdPerOunce <= 0) {
          throw new Error('Gold API returned an invalid price');
        }
        return { usdPerOunce, updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now() };
      }),
    );
  }
}
