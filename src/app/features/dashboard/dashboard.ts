import { Component, computed, inject, signal } from '@angular/core';
import { KARATS, OMR_PER_USD, WeightUnit } from '../../core/gold/gold.constants';
import { I18N_PIPES } from '../../core/i18n/i18n-pipes';
import { PER_UNIT_LABEL, UNIT_LABEL } from '../../core/i18n/labels';
import { GoldPriceStore } from '../../core/prices/gold-price-store';
import { LocalStore } from '../../core/storage/local-store';
import { PriceHistoryCard } from './price-history-card/price-history-card';

@Component({
  selector: 'app-dashboard',
  imports: [PriceHistoryCard, ...I18N_PIPES],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly prices = inject(GoldPriceStore);
  private readonly store = inject(LocalStore);

  protected readonly units: WeightUnit[] = ['gram', 'tola', 'ounce'];
  protected readonly unitLabel = UNIT_LABEL;
  protected readonly perUnitLabel = PER_UNIT_LABEL;
  protected readonly unit = signal<WeightUnit>(this.store.get<WeightUnit>('unit', 'gram'));

  protected readonly pureGramPrice = computed(() => this.prices.price(24));

  protected readonly omrPerOunce = computed(() => this.prices.price(24, 'ounce'));

  protected readonly usdPerOunce = computed(() => {
    const omr = this.omrPerOunce();
    return omr == null ? null : omr / OMR_PER_USD;
  });

  protected readonly karats = computed(() => {
    const unit = this.unit();
    return KARATS.map((k) => ({ ...k, price: this.prices.price(k.karat, unit) }));
  });

  protected setUnit(unit: WeightUnit): void {
    this.unit.set(unit);
    this.store.set('unit', unit);
  }
}
