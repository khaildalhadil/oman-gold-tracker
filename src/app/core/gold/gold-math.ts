import {
  GRAMS_PER_TROY_OUNCE,
  GRAMS_PER_UNIT,
  KARATS,
  Karat,
  OMAN_VAT_RATE,
  OMR_PER_USD,
  WeightUnit,
} from './gold.constants';

export function finenessOf(karat: Karat): number {
  const info = KARATS.find((k) => k.karat === karat);
  if (!info) {
    throw new Error(`Unsupported karat: ${karat}`);
  }
  return info.fineness;
}

/** Converts a USD-per-troy-ounce spot price into OMR per gram of pure gold. */
export function spotToOmrPerGram(usdPerOunce: number): number {
  return (usdPerOunce * OMR_PER_USD) / GRAMS_PER_TROY_OUNCE;
}

/** OMR price for one unit of weight of the given karat. */
export function karatPrice(usdPerOunce: number, karat: Karat, unit: WeightUnit = 'gram'): number {
  const purity = finenessOf(karat) / 1000;
  return spotToOmrPerGram(usdPerOunce) * purity * GRAMS_PER_UNIT[unit];
}

/** Value in OMR of a piece of gold of the given weight (grams) and karat. */
export function goldValue(usdPerOunce: number, grams: number, karat: Karat): number {
  return karatPrice(usdPerOunce, karat) * grams;
}

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
  usdPerOunce: number,
  grams: number,
  karat: Karat,
  makingChargePerGram: number,
  includeVat: boolean,
): PurchaseQuote {
  const value = goldValue(usdPerOunce, grams, karat);
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
