import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { IBoard } from '@/shared/types/board.type';
import type { IColumn } from '@/shared/types/column.type';
import type { ITask } from '@/shared/types/task.type';
import type { SyncOperation } from './types';

export interface OttimizzaDB extends DBSchema {
  boards: {
    key: string;
    value: IBoard;
  };
  columns: {
    key: string;
    value: IColumn;
    indexes: { 'by-board': string };
  };
  tasks: {
    key: string;
    value: ITask;
    indexes: { 'by-column': string };
  };
  syncQueue: {
    key: number;
    value: SyncOperation;
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<OttimizzaDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<OttimizzaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OttimizzaDB>('ottimizza-db', 1, {
      upgrade(db) {
        db.createObjectStore('boards', { keyPath: 'id' });

        const columnStore = db.createObjectStore('columns', { keyPath: 'id' });
        columnStore.createIndex('by-board', 'boardId');

        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-column', 'columnId');

        const syncStore = db.createObjectStore('syncQueue', {
          keyPath: 'queueId',
          autoIncrement: true,
        });
        syncStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}
