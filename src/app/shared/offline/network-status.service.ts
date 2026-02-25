import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '@/shared/constants/api';
const HEALTH_CHECK_INTERVAL_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private destroyRef = inject(DestroyRef);

  readonly isOnline = signal(navigator.onLine);

  private healthCheckId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const onlineHandler = () => this.checkApiHealth();
    const offlineHandler = () => {
      this.isOnline.set(false);
      this.stopHealthCheck();
    };

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    effect(() => {
      if (!this.isOnline()) {
        this.startHealthCheck();
      } else {
        this.stopHealthCheck();
      }
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      this.stopHealthCheck();
    });
  }

  private startHealthCheck() {
    if (this.healthCheckId) return;

    this.healthCheckId = setInterval(() => {
      if (!this.isOnline()) {
        this.checkApiHealth();
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private stopHealthCheck() {
    if (this.healthCheckId) {
      clearInterval(this.healthCheckId);
      this.healthCheckId = null;
    }
  }

  private async checkApiHealth(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/board`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (response.ok) {
        this.isOnline.set(true);
      }
    } catch {}
  }
}
