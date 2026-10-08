import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  message: string;
}

const AUTO_DISMISS_MS = 10_000;

/** In-app notifications shown in the corner of the screen. */
@Injectable({ providedIn: 'root' })
export class Toasts {
  private nextId = 1;
  private readonly _items = signal<Toast[]>([]);

  readonly items = this._items.asReadonly();

  show(title: string, message: string): void {
    const toast = { id: this.nextId++, title, message };
    this._items.update((items) => [...items, toast]);
    setTimeout(() => this.dismiss(toast.id), AUTO_DISMISS_MS);
  }

  dismiss(id: number): void {
    this._items.update((items) => items.filter((t) => t.id !== id));
  }
}
