import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18n, TranslationParams } from './i18n';
import { TranslationKey } from './translations';

// These pipes are impure so they re-run when the language signal changes.

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}

@Pipe({ name: 'omr', pure: false })
export class OmrPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: number | null | undefined): string {
    return value == null ? '—' : this.i18n.formatOmr(value);
  }
}

@Pipe({ name: 'usd', pure: false })
export class UsdPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: number | null | undefined): string {
    return value == null ? '—' : this.i18n.formatUsd(value);
  }
}

@Pipe({ name: 'num', pure: false })
export class NumPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: number | null | undefined, maxFractionDigits = 2): string {
    return value == null ? '—' : this.i18n.formatNumber(value, maxFractionDigits);
  }
}

@Pipe({ name: 'pct', pure: false })
export class PercentPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: number | null | undefined): string {
    return value == null ? '—' : this.i18n.formatPercent(value);
  }
}

@Pipe({ name: 'dt', pure: false })
export class DateTimePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(
    value: number | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions | 'smart',
  ): string {
    return value == null ? '—' : this.i18n.formatDateTime(value, options);
  }
}

export const I18N_PIPES = [TranslatePipe, OmrPipe, UsdPipe, NumPipe, PercentPipe, DateTimePipe];
