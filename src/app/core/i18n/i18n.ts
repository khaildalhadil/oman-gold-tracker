import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { LocalStore } from '../storage/local-store';
import { Lang, TRANSLATIONS, TranslationKey } from './translations';

export type TranslationParams = Record<string, string | number>;

/** Signal-based Arabic/English translations that also flips page direction. */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly store = inject(LocalStore);
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<Lang>(this.store.get<Lang>('lang', 'ar'));
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));
  /** Arabic locale with Latin digits, which read better for prices. */
  readonly locale = computed(() => (this.lang() === 'ar' ? 'ar-OM-u-nu-latn' : 'en-OM'));

  private readonly omrFormat = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'OMR' }),
  );
  private readonly usdFormat = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'USD' }),
  );

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.lang = this.lang();
      root.dir = this.dir();
      this.document.title = this.t('app.title');
      this.store.set('lang', this.lang());
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  toggle(): void {
    this.lang.update((lang) => (lang === 'ar' ? 'en' : 'ar'));
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const text = TRANSLATIONS[this.lang()][key] ?? key;
    if (!params) {
      return text;
    }
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }

  formatOmr(value: number): string {
    return this.omrFormat().format(value);
  }

  formatUsd(value: number): string {
    return this.usdFormat().format(value);
  }

  formatNumber(value: number, maxFractionDigits = 2): string {
    return new Intl.NumberFormat(this.locale(), { maximumFractionDigits: maxFractionDigits }).format(
      value,
    );
  }

  formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${this.formatNumber(value, 2)}%`;
  }

  formatDateTime(value: number | Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(
      this.locale(),
      options ?? { dateStyle: 'medium', timeStyle: 'short' },
    ).format(value);
  }
}
