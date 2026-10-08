import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { quotePurchase } from '../../core/gold/gold-math';
import { I18n } from '../../core/i18n/i18n';
import { GoldPriceStore } from '../../core/prices/gold-price-store';
import { Calculator } from './calculator';

describe('Calculator', () => {
  const usdPerOunce = signal<number | null>(4000);

  beforeEach(() => {
    localStorage.clear();
    usdPerOunce.set(4000);
    TestBed.configureTestingModule({
      imports: [Calculator],
      providers: [{ provide: GoldPriceStore, useValue: { usdPerOunce } }],
    });
    TestBed.inject(I18n).setLang('en');
  });

  async function setup() {
    const fixture = TestBed.createComponent(Calculator);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  function type(el: HTMLElement, name: string, value: string) {
    const input = el.querySelector<HTMLInputElement>(`input[formcontrolname="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('shows the default quote (10 g of 21K with VAT)', async () => {
    const { el } = await setup();
    const expected = quotePurchase(4000, 10, 21, 0, true).total;
    expect(el.querySelector('.total strong')?.textContent).toContain(expected.toFixed(3));
  });

  it('recalculates when making charges change', async () => {
    const { fixture, el } = await setup();
    type(el, 'makingPerGram', '2');
    await fixture.whenStable();
    const expected = quotePurchase(4000, 10, 21, 2, true).total;
    expect(el.querySelector('.total strong')?.textContent).toContain(expected.toFixed(3));
  });

  it('asks for a valid weight', async () => {
    const { fixture, el } = await setup();
    type(el, 'weight', '0');
    await fixture.whenStable();
    expect(el.querySelector('.total')).toBeNull();
    expect(el.querySelector('.empty')?.textContent).toContain('valid weight');
  });
});
