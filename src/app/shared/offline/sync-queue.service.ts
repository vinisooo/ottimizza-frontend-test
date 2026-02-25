import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getDb } from './db';
import { NetworkStatusService } from './network-status.service';
import { isTempId } from './temp-id.util';
import type { SyncEntityType, SyncOperation, SyncPayload } from './types';
import { BoardHttp } from '@/shared/services/board/board';
import { ColumnHttp } from '@/shared/services/board/column/column';
import { TaskHttp } from '@/shared/services/board/task/task';

const MAX_RETRIES = 5;

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private boardHttp = inject(BoardHttp);
  private columnHttp = inject(ColumnHttp);
  private taskHttp = inject(TaskHttp);
  private networkStatus = inject(NetworkStatusService);

  private idMappings = new Map<string, string>();
  private processing = false;

  readonly pendingCount = signal(0);
  readonly syncVersion = signal(0);

  async enqueue(op: Omit<SyncOperation, 'queueId'>): Promise<void> {
    const db = await getDb();
    await db.add('syncQueue', op as SyncOperation);
    await this.updatePendingCount();

    if (this.networkStatus.isOnline()) {
      this.processAll();
    }
  }

  async removeByEntityId(entityId: string): Promise<void> {
    const db = await getDb();
    const all = await db.getAll('syncQueue');
    const tx = db.transaction('syncQueue', 'readwrite');

    for (const op of all) {
      if (op.entityId === entityId) {
        await tx.store.delete(op.queueId!);
      }
    }

    await tx.done;
    await this.updatePendingCount();
  }

  async retryAllFailed(): Promise<void> {
    const db = await getDb();
    const all = await db.getAll('syncQueue');
    const tx = db.transaction('syncQueue', 'readwrite');

    for (const op of all) {
      if (op.status === 'failed') {
        await tx.store.put({ ...op, retryCount: 0, status: 'pending' });
      }
    }

    await tx.done;
    await this.updatePendingCount();
  }

  async processAll(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    let processed = false;

    try {
      const db = await getDb();
      const operations = await db.getAllFromIndex('syncQueue', 'by-timestamp');

      for (const op of operations) {
        if (op.status === 'failed' && op.retryCount >= MAX_RETRIES) continue;
        await this.processOperation(op);
        processed = true;
      }
    } finally {
      this.processing = false;
      this.idMappings.clear();

      if (processed) {
        this.syncVersion.update((v) => v + 1);
      }
    }
  }

  private async processOperation(op: SyncOperation): Promise<void> {
    const resolvedOp = this.resolveTempIds(op);

    try {
      const result = await this.executeHttpOperation(resolvedOp);

      if (op.operationType === 'create' && result?.id) {
        await this.handleIdMapping(op.entityId, result.id, op.entityType);
      }

      const db = await getDb();
      await db.delete('syncQueue', op.queueId!);
      await this.updatePendingCount();
    } catch {
      await this.handleRetry(op);
    }
  }

  private async executeHttpOperation(op: SyncOperation): Promise<{ id: string } | null> {
    const httpMap = {
      board: this.boardHttp,
      column: this.columnHttp,
      task: this.taskHttp,
    };
    const http = httpMap[op.entityType];

    switch (op.operationType) {
      case 'create':
        return firstValueFrom(http.create(op.payload! as never));
      case 'update':
        return firstValueFrom(http.update(op.entityId, op.payload! as never));
      case 'delete':
        await firstValueFrom(http.delete(op.entityId));
        return null;
    }
  }

  private resolveTempIds(op: SyncOperation): SyncOperation {
    let resolvedEntityId = op.entityId;

    if (isTempId(op.entityId) && this.idMappings.has(op.entityId)) {
      resolvedEntityId = this.idMappings.get(op.entityId)!;
    }

    if (!op.payload) return { ...op, entityId: resolvedEntityId };

    const resolvedPayload: Record<string, unknown> = { ...op.payload };
    for (const [key, value] of Object.entries(resolvedPayload)) {
      if (typeof value === 'string' && isTempId(value) && this.idMappings.has(value)) {
        resolvedPayload[key] = this.idMappings.get(value)!;
      }
    }

    return { ...op, entityId: resolvedEntityId, payload: resolvedPayload as unknown as SyncPayload };
  }

  private async handleIdMapping(
    tempId: string,
    serverId: string,
    entityType: SyncEntityType,
  ): Promise<void> {
    this.idMappings.set(tempId, serverId);

    const db = await getDb();
    const storeMap = { board: 'boards', column: 'columns', task: 'tasks' } as const;
    const storeName = storeMap[entityType];

    const entity = await db.get(storeName, tempId);
    if (entity) {
      await db.delete(storeName, tempId);
      await db.put(storeName, { ...entity, id: serverId } as typeof entity);
    }

    if (entityType === 'board') {
      const columns = await db.getAllFromIndex('columns', 'by-board', tempId);
      for (const col of columns) {
        await db.put('columns', { ...col, boardId: serverId });
      }
    } else if (entityType === 'column') {
      const tasks = await db.getAllFromIndex('tasks', 'by-column', tempId);
      for (const task of tasks) {
        await db.put('tasks', { ...task, columnId: serverId });
      }
    }
  }

  private async handleRetry(op: SyncOperation): Promise<void> {
    const db = await getDb();
    const updated: SyncOperation = {
      ...op,
      retryCount: op.retryCount + 1,
      status: op.retryCount + 1 >= MAX_RETRIES ? 'failed' : 'pending',
    };
    await db.put('syncQueue', updated);
  }

  private async updatePendingCount(): Promise<void> {
    const db = await getDb();
    const count = await db.count('syncQueue');
    this.pendingCount.set(count);
  }
}
