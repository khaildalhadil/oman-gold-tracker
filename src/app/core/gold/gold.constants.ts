/** Grams in one troy ounce, the unit spot gold is quoted in. */
export const GRAMS_PER_TROY_OUNCE = 31.1034768;

/** Grams in one tola, a unit still common in Gulf gold markets. */
export const GRAMS_PER_TOLA = 11.6638038;

/**
 * The Omani Rial is pegged to the US dollar at 1 OMR = 2.6008 USD,
 * so 1 USD = 0.3845 OMR.
 */
export const OMR_PER_USD = 0.3845;

/** Standard VAT rate in Oman, applied to jewellery purchases. */
export const OMAN_VAT_RATE = 0.05;

export type Karat = 24 | 22 | 21 | 18;

export interface KaratInfo {
  karat: Karat;
  /** Hallmark fineness in parts per thousand (e.g. 916 for 22K). */
  fineness: number;
}

export const KARATS: readonly KaratInfo[] = [
  { karat: 24, fineness: 999 },
  { karat: 22, fineness: 916 },
  { karat: 21, fineness: 875 },
  { karat: 18, fineness: 750 },
];

export type WeightUnit = 'gram' | 'tola' | 'ounce';

export const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  gram: 1,
  tola: GRAMS_PER_TOLA,
  ounce: GRAMS_PER_TROY_OUNCE,
};
