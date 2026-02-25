import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getDb } from '@/shared/offline/db';
import { NetworkStatusService } from '@/shared/offline/network-status.service';
import { SyncQueueService } from '@/shared/offline/sync-queue.service';
import { generateTempId, isTempId } from '@/shared/offline/temp-id.util';
import type { IColumn, IColumnCreate } from '@/shared/types/column.type';
import { ColumnHttp } from './column';

@Injectable({ providedIn: 'root' })
export class ColumnStore {
  private http = inject(ColumnHttp);
  private syncQueue = inject(SyncQueueService);
  private networkStatus = inject(NetworkStatusService);

  readonly columns = signal<IColumn[]>([]);
  readonly loading = signal(false);

  private currentBoardId = '';
  private initialized = false;

  constructor() {
    effect(() => {
      const online = this.networkStatus.isOnline();
      this.syncQueue.syncVersion();

      if (online && this.initialized) {
        this.loadByBoard(this.currentBoardId);
      }
    });
  }

  async loadByBoard(boardId: string): Promise<void> {
    this.currentBoardId = boardId;
    this.loading.set(true);

    const db = await getDb();
    const local = await db.getAllFromIndex('columns', 'by-board', boardId);
    this.columns.set(local.sort((a, b) => a.position - b.position));
    this.loading.set(false);
    this.initialized = true;

    if (this.networkStatus.isOnline()) {
      try {
        const remote = await firstValueFrom(this.http.getByBoard(boardId));
        await this.reconcile(remote, boardId);
      } catch {}
    }
  }

  async create(body: IColumnCreate): Promise<IColumn> {
    const tempId = generateTempId();
    const column: IColumn = { ...body, id: tempId };

    const db = await getDb();
    await db.put('columns', column);
    this.columns.update((list) => [...list, column]);

    await this.syncQueue.enqueue({
      entityType: 'column',
      operationType: 'create',
      entityId: tempId,
      payload: body,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    });

    return column;
  }

  async update(id: string, body: IColumnCreate): Promise<IColumn> {
    const column: IColumn = { ...body, id };

    const db = await getDb();
    await db.put('columns', column);
    this.columns.update((list) =>
      list.map((c) => (c.id === id ? column : c)).sort((a, b) => a.position - b.position),
    );

    if (!isTempId(id)) {
      await this.syncQueue.enqueue({
        entityType: 'column',
        operationType: 'update',
        entityId: id,
        payload: body,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }

    return column;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('columns', id);
    this.columns.update((list) => list.filter((c) => c.id !== id));

    if (isTempId(id)) {
      await this.syncQueue.removeByEntityId(id);
    } else {
      await this.syncQueue.enqueue({
        entityType: 'column',
        operationType: 'delete',
        entityId: id,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }
  }

  private async reconcile(remote: IColumn[], boardId: string): Promise<void> {
    const db = await getDb();

    const allOps = await db.getAll('syncQueue');
    const pendingColumnIds = new Set(
      allOps.filter((op) => op.entityType === 'column').map((op) => op.entityId),
    );

    const tx = db.transaction('columns', 'readwrite');
    const local = await tx.store.index('by-board').getAll(boardId);

    for (const item of local) {
      if (!isTempId(item.id) && !pendingColumnIds.has(item.id)) {
        await tx.store.delete(item.id);
      }
    }

    for (const item of remote) {
      if (!pendingColumnIds.has(item.id)) {
        await tx.store.put(item);
      }
    }

    await tx.done;

    const all = await db.getAllFromIndex('columns', 'by-board', boardId);
    this.columns.set(all.sort((a, b) => a.position - b.position));
  }
}
