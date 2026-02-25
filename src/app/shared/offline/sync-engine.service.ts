import { DestroyRef, effect, inject, Injectable } from '@angular/core';
import { NetworkStatusService } from './network-status.service';
import { SyncQueueService } from './sync-queue.service';

const RETRY_INTERVAL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class SyncEngineService {
  private networkStatus = inject(NetworkStatusService);
  private syncQueue = inject(SyncQueueService);
  private destroyRef = inject(DestroyRef);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      if (this.networkStatus.isOnline()) {
        this.syncQueue.retryAllFailed().then(() => this.syncQueue.processAll());
        this.startPeriodicRetry();
      } else {
        this.stopPeriodicRetry();
      }
    });

    this.destroyRef.onDestroy(() => this.stopPeriodicRetry());
  }

  private startPeriodicRetry() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      if (this.networkStatus.isOnline() && this.syncQueue.pendingCount() > 0) {
        this.syncQueue.retryAllFailed().then(() => this.syncQueue.processAll());
      }
    }, RETRY_INTERVAL_MS);
  }

  private stopPeriodicRetry() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
