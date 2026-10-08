import { Component, computed, inject, signal } from '@angular/core';
import { karatPrice } from '../../core/gold/gold-math';
import { GRAMS_PER_TROY_OUNCE, KARATS, WeightUnit } from '../../core/gold/gold.constants';
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

  protected readonly pureGramPrice = computed(() => {
    const usd = this.prices.usdPerOunce();
    return usd == null ? null : karatPrice(usd, 24);
  });

  protected readonly omrPerOunce = computed(() => {
    const perGram = this.pureGramPrice();
    return perGram == null ? null : perGram * GRAMS_PER_TROY_OUNCE;
  });

  protected readonly karats = computed(() => {
    const usd = this.prices.usdPerOunce();
    const unit = this.unit();
    return KARATS.map((k) => ({
      ...k,
      price: usd == null ? null : karatPrice(usd, k.karat, unit),
    }));
  });

  protected setUnit(unit: WeightUnit): void {
    this.unit.set(unit);
    this.store.set('unit', unit);
  }
}
