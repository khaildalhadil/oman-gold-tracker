import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { KARATS, Karat } from '../../core/gold/gold.constants';
import { I18n } from '../../core/i18n/i18n';
import { I18N_PIPES } from '../../core/i18n/i18n-pipes';
import { HoldingValuation, PortfolioStore, valuePortfolio } from '../../core/portfolio/portfolio-store';
import { GoldPriceStore } from '../../core/prices/gold-price-store';

/** Today's date as yyyy-mm-dd in local time. */
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-portfolio',
  imports: [ReactiveFormsModule, ...I18N_PIPES],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  private readonly prices = inject(GoldPriceStore);
  private readonly portfolio = inject(PortfolioStore);
  private readonly i18n = inject(I18n);

  protected readonly karats = KARATS;
  protected readonly maxDate = today();

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    grams: [null as number | null, [Validators.required, Validators.min(0.001)]],
    karat: [21 as Karat],
    cost: [null as number | null, [Validators.required, Validators.min(0)]],
    purchasedOn: [today(), [Validators.required]],
  });

  protected readonly holdings = this.portfolio.holdings;

  protected readonly summary = computed(() => {
    const usd = this.prices.usdPerOunce();
    return usd == null ? null : valuePortfolio(this.holdings(), usd);
  });

  protected add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, grams, karat, cost, purchasedOn } = this.form.getRawValue();
    this.portfolio.add({ name: name.trim(), grams: grams!, karat, cost: cost!, purchasedOn });
    this.form.reset({ karat, purchasedOn: today() });
  }

  protected remove(holding: HoldingValuation): void {
    if (confirm(this.i18n.t('portfolio.confirmRemove', { name: holding.name }))) {
      this.portfolio.remove(holding.id);
    }
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
