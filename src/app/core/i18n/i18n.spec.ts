import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    i18n = TestBed.inject(I18n);
  });

  it('defaults to Arabic and right-to-left', () => {
    expect(i18n.lang()).toBe('ar');
    expect(i18n.dir()).toBe('rtl');
    expect(i18n.t('nav.prices')).toBe('الأسعار');
  });

  it('switches to English and updates the document', () => {
    i18n.toggle();
    TestBed.tick();
    expect(i18n.t('nav.prices')).toBe('Prices');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('remembers the chosen language', () => {
    i18n.setLang('en');
    TestBed.tick();
    expect(localStorage.getItem('omanGoldTracker.lang')).toBe('"en"');
  });

  it('formats OMR with three decimals and Latin digits', () => {
    expect(i18n.formatOmr(49.4479)).toContain('49.448');
    i18n.setLang('en');
    expect(i18n.formatOmr(49.4479)).toContain('49.448');
  });

  it('signs percentages', () => {
    i18n.setLang('en');
    expect(i18n.formatPercent(1.234)).toBe('+1.23%');
    expect(i18n.formatPercent(-0.5)).toBe('-0.5%');
  });
});
