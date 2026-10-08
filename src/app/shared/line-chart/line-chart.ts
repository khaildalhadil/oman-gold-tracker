import { Component, computed, input, signal } from '@angular/core';

export interface ChartPoint {
  t: number;
  v: number;
}

interface PlottedPoint extends ChartPoint {
  /** Position as a percentage of the plot width/height. */
  x: number;
  y: number;
}

const WIDTH = 600;
const HEIGHT = 220;
let nextId = 0;

/** Dependency-free SVG line chart with a hover tooltip. Time runs left to right. */
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
  host: { dir: 'ltr' },
})
export class LineChart {
  readonly points = input.required<ChartPoint[]>();
  readonly formatValue = input<(v: number) => string>((v) => v.toFixed(2));
  readonly formatTime = input<(t: number) => string>((t) => new Date(t).toLocaleString());
  readonly label = input('');

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly gradientId = `line-chart-fill-${nextId++}`;
  protected readonly hoverIndex = signal<number | null>(null);

  protected readonly plot = computed(() => {
    const points = this.points();
    if (points.length < 2) {
      return null;
    }
    const minT = points[0].t;
    const maxT = points[points.length - 1].t;
    let minV = Math.min(...points.map((p) => p.v));
    let maxV = Math.max(...points.map((p) => p.v));
    // Pad the range so a flat line doesn't sit on the chart edge.
    const pad = (maxV - minV || maxV * 0.001) * 0.15;
    minV -= pad;
    maxV += pad;

    const plotted: PlottedPoint[] = points.map((p) => ({
      ...p,
      x: maxT === minT ? 0 : ((p.t - minT) / (maxT - minT)) * 100,
      y: (1 - (p.v - minV) / (maxV - minV)) * 100,
    }));
    const toSvg = (p: PlottedPoint) =>
      `${((p.x / 100) * WIDTH).toFixed(2)},${((p.y / 100) * HEIGHT).toFixed(2)}`;
    const line = 'M' + plotted.map(toSvg).join(' L');
    const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

    return { plotted, line, area, minV, maxV, minT, maxT };
  });

  protected readonly hovered = computed(() => {
    const index = this.hoverIndex();
    const plot = this.plot();
    return index == null || !plot ? null : plot.plotted[index];
  });

  protected onPointerMove(event: PointerEvent): void {
    const plot = this.plot();
    if (!plot) {
      return;
    }
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    let best = 0;
    for (let i = 1; i < plot.plotted.length; i++) {
      if (Math.abs(plot.plotted[i].x - xPct) < Math.abs(plot.plotted[best].x - xPct)) {
        best = i;
      }
    }
    this.hoverIndex.set(best);
  }
}
