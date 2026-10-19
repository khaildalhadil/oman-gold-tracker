import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { quotePurchase } from '../../core/gold/gold-math';
import { GRAMS_PER_UNIT, KARATS, Karat, WeightUnit } from '../../core/gold/gold.constants';
import { I18N_PIPES } from '../../core/i18n/i18n-pipes';
import { UNIT_LABEL } from '../../core/i18n/labels';
import { GoldPriceStore } from '../../core/prices/gold-price-store';

@Component({
  selector: 'app-calculator',
  imports: [ReactiveFormsModule, ...I18N_PIPES],
  templateUrl: './calculator.html',
  styleUrl: './calculator.scss',
})
export class Calculator {
  private readonly prices = inject(GoldPriceStore);

  protected readonly karats = KARATS;
  protected readonly units: WeightUnit[] = ['gram', 'tola', 'ounce'];
  protected readonly unitLabel = UNIT_LABEL;

  protected readonly form = inject(NonNullableFormBuilder).group({
    weight: [10, [Validators.required, Validators.min(0.001)]],
    unit: ['gram' as WeightUnit],
    karat: [21 as Karat],
    makingPerGram: [0, [Validators.min(0)]],
    includeVat: [true],
  });

  protected readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly grams = computed(() => {
    const { weight, unit } = this.value();
    return Number(weight) * GRAMS_PER_UNIT[unit];
  });

  protected readonly pricePerGram = computed(() => this.prices.price(this.value().karat));

  protected readonly quote = computed(() => {
    const price = this.pricePerGram();
    const { makingPerGram, includeVat } = this.value();
    const grams = this.grams();
    const making = Number(makingPerGram);
    if (price == null || !(grams > 0) || !(making >= 0)) {
      return null;
    }
    return quotePurchase(price, grams, making, includeVat);
  });
}
