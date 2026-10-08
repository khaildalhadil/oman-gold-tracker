import { Injectable } from '@angular/core';

const PREFIX = 'omanGoldTracker.';

/**
 * Small JSON wrapper around localStorage. Every access is guarded because
 * storage can be unavailable (private mode, blocked site data, quota).
 */
@Injectable({ providedIn: 'root' })
export class LocalStore {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage is best-effort; the app keeps working in memory.
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // Ignore, see set().
    }
  }
}
