import { WeightUnit } from '../gold/gold.constants';
import { TranslationKey } from './translations';

export const UNIT_LABEL: Record<WeightUnit, TranslationKey> = {
  gram: 'unit.gram',
  tola: 'unit.tola',
  ounce: 'unit.ounce',
};

export const PER_UNIT_LABEL: Record<WeightUnit, TranslationKey> = {
  gram: 'unit.per.gram',
  tola: 'unit.per.tola',
  ounce: 'unit.per.ounce',
};
