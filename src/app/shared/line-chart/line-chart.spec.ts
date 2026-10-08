import { TestBed } from '@angular/core/testing';
import { ChartPoint, LineChart } from './line-chart';

describe('LineChart', () => {
  async function render(points: ChartPoint[]) {
    const fixture = TestBed.createComponent(LineChart);
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('formatValue', (v: number) => v.toFixed(1));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders nothing with fewer than two points', async () => {
    const el = await render([{ t: 1, v: 10 }]);
    expect(el.querySelector('svg')).toBeNull();
  });

  it('draws a line and padded axis labels', async () => {
    const el = await render([
      { t: 0, v: 10 },
      { t: 50, v: 20 },
      { t: 100, v: 15 },
    ]);
    const line = el.querySelector('path.line')?.getAttribute('d');
    expect(line?.startsWith('M0.00,')).toBe(true);
    expect(line?.split('L')).toHaveLength(3);
    const labels = Array.from(el.querySelectorAll('.y-axis span')).map((s) => s.textContent);
    expect(labels).toEqual(['21.5', '8.5']);
  });
});
