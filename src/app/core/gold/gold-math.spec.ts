import { percentChange, quotePurchase } from './gold-math';

describe('gold-math', () => {
  const pricePerGram = 46.72; // OMR, 22K

  it('quotes a purchase with making charges and VAT', () => {
    const quote = quotePurchase(pricePerGram, 10, 2, true);
    const value = pricePerGram * 10;
    expect(quote.goldValue).toBeCloseTo(value, 6);
    expect(quote.makingCharges).toBe(20);
    expect(quote.vat).toBeCloseTo((value + 20) * 0.05, 6);
    expect(quote.total).toBeCloseTo((value + 20) * 1.05, 6);
  });

  it('omits VAT and ignores negative making charges', () => {
    const quote = quotePurchase(pricePerGram, 5, -3, false);
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
