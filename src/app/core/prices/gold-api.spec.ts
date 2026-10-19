import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GOLD_PRICES_URL, GoldApi, PriceQuote } from './gold-api';

describe('GoldApi', () => {
  let api: GoldApi;
  let http: HttpTestingController;
  const updatedAt = '2026-10-08T11:46:07Z';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(GoldApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps the karat list to a quote', () => {
    let quote: PriceQuote | undefined;
    api.fetchPrices().subscribe((q) => (quote = q));
    http.expectOne(GOLD_PRICES_URL).flush([
      { karat: 24, pricePerGram: 50.95, currency: 'OMR', updatedAt },
      { karat: 22, pricePerGram: 46.72, currency: 'OMR', updatedAt },
      { karat: 21, pricePerGram: 44.63, currency: 'OMR', updatedAt },
      { karat: 18, pricePerGram: 38.25, currency: 'OMR', updatedAt },
    ]);
    expect(quote).toEqual({
      perGram: { 24: 50.95, 22: 46.72, 21: 44.63, 18: 38.25 },
      updatedAt: Date.parse(updatedAt),
    });
  });

  it('errors when a karat is missing', () => {
    let error: unknown;
    api.fetchPrices().subscribe({ error: (e) => (error = e) });
    http
      .expectOne(GOLD_PRICES_URL)
      .flush([{ karat: 24, pricePerGram: 50.95, currency: 'OMR', updatedAt }]);
    expect(error).toBeInstanceOf(Error);
  });
});
