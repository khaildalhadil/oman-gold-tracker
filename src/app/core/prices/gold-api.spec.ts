import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GOLD_API_URL, GoldApi, SpotQuote } from './gold-api';

describe('GoldApi', () => {
  let api: GoldApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(GoldApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps the response to a spot quote', () => {
    let quote: SpotQuote | undefined;
    api.fetchSpot().subscribe((q) => (quote = q));
    http
      .expectOne(GOLD_API_URL)
      .flush({ price: 4125.9, updatedAt: '2026-10-08T11:46:07Z', symbol: 'XAU' });
    expect(quote).toEqual({ usdPerOunce: 4125.9, updatedAt: Date.parse('2026-10-08T11:46:07Z') });
  });

  it('errors on an invalid price', () => {
    let error: unknown;
    api.fetchSpot().subscribe({ error: (e) => (error = e) });
    http.expectOne(GOLD_API_URL).flush({ price: null, updatedAt: '2026-10-08T11:46:07Z' });
    expect(error).toBeInstanceOf(Error);
  });
});
