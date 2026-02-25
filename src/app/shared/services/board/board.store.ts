import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getDb } from '@/shared/offline/db';
import { NetworkStatusService } from '@/shared/offline/network-status.service';
import { SyncQueueService } from '@/shared/offline/sync-queue.service';
import { generateTempId, isTempId } from '@/shared/offline/temp-id.util';
import type { IBoard, IBoardCreate } from '@/shared/types/board.type';
import { BoardHttp } from './board';

@Injectable({ providedIn: 'root' })
export class BoardStore {
  private http = inject(BoardHttp);
  private syncQueue = inject(SyncQueueService);
  private networkStatus = inject(NetworkStatusService);

  readonly boards = signal<IBoard[]>([]);
  readonly loading = signal(false);

  private initialized = false;

  constructor() {
    effect(() => {
      const online = this.networkStatus.isOnline();
      this.syncQueue.syncVersion();

      if (online && this.initialized) {
        this.loadAll();
      }
    });
  }

  async loadAll(): Promise<void> {
    this.loading.set(true);

    const db = await getDb();
    const local = await db.getAll('boards');
    this.boards.set(local);
    this.loading.set(false);
    this.initialized = true;

    if (this.networkStatus.isOnline()) {
      try {
        const remote = await firstValueFrom(this.http.getAll());
        await this.reconcile(remote);
      } catch {}
    }
  }

  async create(body: IBoardCreate): Promise<IBoard> {
    const tempId = generateTempId();
    const board: IBoard = { ...body, id: tempId };

    const db = await getDb();
    await db.put('boards', board);
    this.boards.update((list) => [...list, board]);

    await this.syncQueue.enqueue({
      entityType: 'board',
      operationType: 'create',
      entityId: tempId,
      payload: body,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    });

    return board;
  }

  async update(id: string, body: IBoardCreate): Promise<IBoard> {
    const board: IBoard = { ...body, id };

    const db = await getDb();
    await db.put('boards', board);
    this.boards.update((list) => list.map((b) => (b.id === id ? board : b)));

    if (!isTempId(id)) {
      await this.syncQueue.enqueue({
        entityType: 'board',
        operationType: 'update',
        entityId: id,
        payload: body,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }

    return board;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('boards', id);
    this.boards.update((list) => list.filter((b) => b.id !== id));

    if (isTempId(id)) {
      await this.syncQueue.removeByEntityId(id);
    } else {
      await this.syncQueue.enqueue({
        entityType: 'board',
        operationType: 'delete',
        entityId: id,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }
  }

  private async reconcile(remote: IBoard[]): Promise<void> {
    const db = await getDb();

    const allOps = await db.getAll('syncQueue');
    const pendingBoardIds = new Set(
      allOps.filter((op) => op.entityType === 'board').map((op) => op.entityId),
    );

    const tx = db.transaction('boards', 'readwrite');
    const local = await tx.store.getAll();

    for (const item of local) {
      if (!isTempId(item.id) && !pendingBoardIds.has(item.id)) {
        await tx.store.delete(item.id);
      }
    }

    for (const item of remote) {
      if (!pendingBoardIds.has(item.id)) {
        await tx.store.put(item);
      }
    }

    await tx.done;

    const all = await db.getAll('boards');
    this.boards.set(all);
  }
}
