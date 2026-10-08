import {
  finenessOf,
  goldValue,
  karatPrice,
  percentChange,
  quotePurchase,
  spotToOmrPerGram,
} from './gold-math';
import { GRAMS_PER_TOLA, GRAMS_PER_TROY_OUNCE, OMR_PER_USD } from './gold.constants';

describe('gold-math', () => {
  const spot = 4000; // USD per troy ounce
  const pureOmrPerGram = (spot * OMR_PER_USD) / GRAMS_PER_TROY_OUNCE;

  it('converts spot USD/oz to OMR per gram using the peg', () => {
    expect(spotToOmrPerGram(spot)).toBeCloseTo(pureOmrPerGram, 6);
    expect(spotToOmrPerGram(spot)).toBeCloseTo(49.448, 3);
  });

  it('knows the hallmark fineness of each karat', () => {
    expect(finenessOf(24)).toBe(999);
    expect(finenessOf(22)).toBe(916);
    expect(finenessOf(21)).toBe(875);
    expect(finenessOf(18)).toBe(750);
  });

  it('prices each karat by its purity', () => {
    expect(karatPrice(spot, 22)).toBeCloseTo(pureOmrPerGram * 0.916, 6);
    expect(karatPrice(spot, 18)).toBeCloseTo(pureOmrPerGram * 0.75, 6);
  });

  it('prices other weight units', () => {
    expect(karatPrice(spot, 24, 'tola')).toBeCloseTo(karatPrice(spot, 24) * GRAMS_PER_TOLA, 6);
    expect(karatPrice(spot, 24, 'ounce')).toBeCloseTo(spot * OMR_PER_USD * 0.999, 6);
  });

  it('values a piece by weight', () => {
    expect(goldValue(spot, 10, 21)).toBeCloseTo(karatPrice(spot, 21) * 10, 6);
  });

  it('quotes a purchase with making charges and VAT', () => {
    const quote = quotePurchase(spot, 10, 22, 2, true);
    const value = karatPrice(spot, 22) * 10;
    expect(quote.goldValue).toBeCloseTo(value, 6);
    expect(quote.makingCharges).toBe(20);
    expect(quote.vat).toBeCloseTo((value + 20) * 0.05, 6);
    expect(quote.total).toBeCloseTo((value + 20) * 1.05, 6);
  });

  it('omits VAT and ignores negative making charges', () => {
    const quote = quotePurchase(spot, 5, 24, -3, false);
    expect(quote.makingCharges).toBe(0);
    expect(quote.vat).toBe(0);
    expect(quote.total).toBeCloseTo(quote.goldValue, 6);
  });

  it('computes percent change and guards a zero baseline', () => {
    expect(percentChange(100, 110)).toBeCloseTo(10, 6);
    expect(percentChange(100, 95)).toBeCloseTo(-5, 6);
    expect(percentChange(0, 10)).toBe(0);
  });
});
