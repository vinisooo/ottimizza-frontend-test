import type { IBoardCreate } from '@/shared/types/board.type';
import type { IColumnCreate } from '@/shared/types/column.type';
import type { ITaskCreate } from '@/shared/types/task.type';

export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'board' | 'column' | 'task';
export type SyncStatus = 'pending' | 'in-progress' | 'failed';
export type SyncPayload = IBoardCreate | IColumnCreate | ITaskCreate;

export interface SyncOperation {
  queueId?: number;
  entityType: SyncEntityType;
  operationType: SyncOperationType;
  entityId: string;
  payload?: SyncPayload;
  timestamp: number;
  retryCount: number;
  status: SyncStatus;
}
