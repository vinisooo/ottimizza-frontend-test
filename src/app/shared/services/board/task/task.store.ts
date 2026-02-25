import { effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getDb } from '@/shared/offline/db';
import { NetworkStatusService } from '@/shared/offline/network-status.service';
import { SyncQueueService } from '@/shared/offline/sync-queue.service';
import { generateTempId, isTempId } from '@/shared/offline/temp-id.util';
import type { ITask, ITaskCreate } from '@/shared/types/task.type';
import type { IColumn } from '@/shared/types/column.type';
import { TaskHttp } from './task';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private http = inject(TaskHttp);
  private syncQueue = inject(SyncQueueService);
  private networkStatus = inject(NetworkStatusService);

  readonly tasksByColumn = signal<Record<string, ITask[]>>({});
  readonly loading = signal(false);

  private currentColumnIds: string[] = [];
  private initialized = false;

  constructor() {
    effect(() => {
      const online = this.networkStatus.isOnline();
      this.syncQueue.syncVersion();

      if (online && this.initialized) {
        this.reloadCurrentColumns();
      }
    });
  }

  async loadByColumns(columns: IColumn[]): Promise<void> {
    if (!columns.length) return;

    this.currentColumnIds = columns.map((c) => c.id);
    this.loading.set(true);

    const db = await getDb();
    const result: Record<string, ITask[]> = {};

    for (const col of columns) {
      const tasks = await db.getAllFromIndex('tasks', 'by-column', col.id);
      result[col.id] = tasks.sort((a, b) => a.position - b.position);
    }

    this.tasksByColumn.set(result);
    this.loading.set(false);
    this.initialized = true;

    if (this.networkStatus.isOnline()) {
      try {
        await this.reconcileAll(columns);
      } catch {}
    }
  }

  async create(body: ITaskCreate): Promise<ITask> {
    const tempId = generateTempId();
    const task: ITask = { ...body, id: tempId };

    const db = await getDb();
    await db.put('tasks', task);
    this.tasksByColumn.update((map) => ({
      ...map,
      [body.columnId]: [...(map[body.columnId] ?? []), task],
    }));

    await this.syncQueue.enqueue({
      entityType: 'task',
      operationType: 'create',
      entityId: tempId,
      payload: body,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    });

    return task;
  }

  async update(id: string, body: ITaskCreate): Promise<ITask> {
    const task: ITask = { ...body, id };

    const db = await getDb();
    const oldTask = await db.get('tasks', id);
    await db.put('tasks', task);

    this.tasksByColumn.update((map) => {
      const updated = { ...map };

      if (oldTask && oldTask.columnId !== body.columnId) {
        updated[oldTask.columnId] = (updated[oldTask.columnId] ?? []).filter((t) => t.id !== id);
      }

      updated[body.columnId] = (updated[body.columnId] ?? [])
        .filter((t) => t.id !== id)
        .concat(task)
        .sort((a, b) => a.position - b.position);

      return updated;
    });

    if (!isTempId(id)) {
      await this.syncQueue.enqueue({
        entityType: 'task',
        operationType: 'update',
        entityId: id,
        payload: body,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }

    return task;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    const task = await db.get('tasks', id);
    await db.delete('tasks', id);

    if (task) {
      this.tasksByColumn.update((map) => ({
        ...map,
        [task.columnId]: (map[task.columnId] ?? []).filter((t) => t.id !== id),
      }));
    }

    if (isTempId(id)) {
      await this.syncQueue.removeByEntityId(id);
    } else {
      await this.syncQueue.enqueue({
        entityType: 'task',
        operationType: 'delete',
        entityId: id,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      });
    }
  }

  private async reloadCurrentColumns(): Promise<void> {
    if (!this.currentColumnIds.length) return;
    const columns = this.currentColumnIds.map((id) => ({ id }) as IColumn);
    await this.loadByColumns(columns);
  }

  private async reconcileAll(columns: IColumn[]): Promise<void> {
    const db = await getDb();

    const allOps = await db.getAll('syncQueue');
    const pendingTaskIds = new Set(
      allOps.filter((op) => op.entityType === 'task').map((op) => op.entityId),
    );

    const result: Record<string, ITask[]> = {};

    for (const col of columns) {
      const remote = await firstValueFrom(this.http.getByColumn(col.id));

      const tx = db.transaction('tasks', 'readwrite');
      const local = await tx.store.index('by-column').getAll(col.id);

      for (const item of local) {
        if (!isTempId(item.id) && !pendingTaskIds.has(item.id)) {
          await tx.store.delete(item.id);
        }
      }

      for (const item of remote) {
        if (!pendingTaskIds.has(item.id)) {
          await tx.store.put(item);
        }
      }

      await tx.done;

      const all = await db.getAllFromIndex('tasks', 'by-column', col.id);
      result[col.id] = all.sort((a, b) => a.position - b.position);
    }

    this.tasksByColumn.set(result);
  }
}
