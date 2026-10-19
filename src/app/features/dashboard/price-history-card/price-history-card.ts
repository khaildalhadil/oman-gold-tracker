import { Component, computed, inject, signal } from '@angular/core';
import { percentChange } from '../../../core/gold/gold-math';
import { I18n } from '../../../core/i18n/i18n';
import { I18N_PIPES } from '../../../core/i18n/i18n-pipes';
import { TranslationKey } from '../../../core/i18n/translations';
import { PriceHistory } from '../../../core/prices/price-history';
import { ChartPoint, LineChart } from '../../../shared/line-chart/line-chart';

type Range = '24h' | '7d' | '30d' | 'all';

const HOUR = 60 * 60 * 1000;
const RANGES: { id: Range; label: TranslationKey; ms: number }[] = [
  { id: '24h', label: 'history.range.24h', ms: 24 * HOUR },
  { id: '7d', label: 'history.range.7d', ms: 7 * 24 * HOUR },
  { id: '30d', label: 'history.range.30d', ms: 30 * 24 * HOUR },
  { id: 'all', label: 'history.range.all', ms: Infinity },
];

/** 24K price-per-gram chart built from the locally recorded history. */
@Component({
  selector: 'app-price-history-card',
  imports: [LineChart, ...I18N_PIPES],
  templateUrl: './price-history-card.html',
  styleUrl: './price-history-card.scss',
})
export class PriceHistoryCard {
  private readonly history = inject(PriceHistory);
  private readonly i18n = inject(I18n);

  protected readonly ranges = RANGES;
  protected readonly range = signal<Range>('24h');

  protected readonly points = computed<ChartPoint[]>(() => {
    const range = RANGES.find((r) => r.id === this.range())!;
    const all = this.history.points();
    const from = Number.isFinite(range.ms) ? Date.now() - range.ms : -Infinity;
    return all.filter((p) => p.t >= from).map((p) => ({ t: p.t, v: p.omr }));
  });

  protected readonly stats = computed(() => {
    const points = this.points();
    if (points.length < 2) {
      return null;
    }
    const values = points.map((p) => p.v);
    return {
      high: Math.max(...values),
      low: Math.min(...values),
      change: percentChange(points[0].v, points[points.length - 1].v),
    };
  });

  protected readonly formatValue = (v: number) => this.i18n.formatNumber(v, 3);
  protected readonly formatTime = (t: number) => this.i18n.formatDateTime(t, 'smart');
}
