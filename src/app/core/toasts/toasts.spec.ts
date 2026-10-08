import { TestBed } from '@angular/core/testing';
import { Toasts } from './toasts';

describe('Toasts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows, dismisses and auto-dismisses toasts', () => {
    const toasts = TestBed.inject(Toasts);
    toasts.show('A', 'first');
    toasts.show('B', 'second');
    expect(toasts.items().map((t) => t.title)).toEqual(['A', 'B']);

    toasts.dismiss(toasts.items()[0].id);
    expect(toasts.items().map((t) => t.title)).toEqual(['B']);

    vi.advanceTimersByTime(10_000);
    expect(toasts.items()).toEqual([]);
  });
});
