import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/i18n-pipes';
import { Toasts } from '../../core/toasts/toasts';

@Component({
  selector: 'app-toast-host',
  imports: [TranslatePipe],
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toasts.items(); track toast.id) {
        <div class="toast" role="status">
          <div>
            <strong>{{ toast.title }}</strong>
            <p>{{ toast.message }}</p>
          </div>
          <button
            type="button"
            class="close"
            [attr.aria-label]="'toast.dismiss' | t"
            (click)="toasts.dismiss(toast.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      inset-block-end: 16px;
      inset-inline-end: 16px;
      z-index: 50;
      display: grid;
      gap: 10px;
      width: min(360px, calc(100vw - 32px));
    }

    .toast {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-sm);
      background: var(--surface-2);
      border: 1px solid var(--gold);
      box-shadow: var(--shadow);
      animation: slide-in 0.2s ease-out;

      p {
        margin: 2px 0 0;
        color: var(--text-muted);
      }
    }

    .close {
      border: 0;
      background: none;
      font-size: 1.4rem;
      line-height: 1;
      cursor: pointer;
      color: var(--text-muted);
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
})
export class ToastHost {
  protected readonly toasts = inject(Toasts);
}
