import { OMAN_VAT_RATE } from './gold.constants';

export interface PurchaseQuote {
  goldValue: number;
  makingCharges: number;
  vat: number;
  total: number;
}

/**
 * Estimates what a jeweller would charge: gold value plus making charges
 * (per gram), with optional VAT on the subtotal.
 */
export function quotePurchase(
  pricePerGram: number,
  grams: number,
  makingChargePerGram: number,
  includeVat: boolean,
): PurchaseQuote {
  const value = pricePerGram * grams;
  const making = Math.max(0, makingChargePerGram) * grams;
  const vat = includeVat ? (value + making) * OMAN_VAT_RATE : 0;
  return { goldValue: value, makingCharges: making, vat, total: value + making + vat };
}

/** Percentage change from `previous` to `current`; 0 when there is no baseline. */
export function percentChange(previous: number, current: number): number {
  if (!previous) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}
