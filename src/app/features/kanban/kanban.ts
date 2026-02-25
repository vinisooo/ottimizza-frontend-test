import { NavBar } from '@/shared/components/nav-bar/nav-bar';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { ColumnStore } from '@/shared/services/board/column/column.store';
import { TaskStore } from '@/shared/services/board/task/task.store';
import { BoardStore } from '@/shared/services/board/board.store';
import type { IBoard } from '@/shared/types/board.type';
import type { IColumn } from '@/shared/types/column.type';
import type { ITask } from '@/shared/types/task.type';
import { Component, computed, effect, inject, type OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDropList, type CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanColumnCreate } from './components/kanban-column-create/kanban-column-create';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { KanbanColumn } from './components/kanban-column/kanban-column';


@Component({
  selector: 'app-kanban',
  imports: [
    NavBar,
    ZardButtonComponent,
    ZardIconComponent,
    CdkDropList,
    KanbanColumn,
    KanbanColumnCreate,
    ZardBadgeComponent,
  ],
  templateUrl: './kanban.html',
})
export class Kanban implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardStore = inject(BoardStore);
  protected columnStore = inject(ColumnStore);
  protected taskStore = inject(TaskStore);

  protected board = signal<IBoard | null>(null);
  protected columns = this.columnStore.columns;
  protected tasksByColumn = this.taskStore.tasksByColumn;

  protected columnIds = computed(() => this.columns().map((c) => c.id));

  protected boardId = '';

  constructor() {
    effect(() => {
      const columns = this.columns();
      if (columns.length) {
        this.taskStore.loadByColumns(columns);
      }
    });
  }

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id')!;
    this.loadBoard(this.boardId);
    this.columnStore.loadByBoard(this.boardId);
  }

  protected goBack() {
    this.router.navigate(['/']);
  }

  protected onColumnDropped(event: CdkDragDrop<IColumn[]>) {
    const columns = [...this.columns()];
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    this.columnStore.columns.set(columns);

    const movedColumn = columns[event.currentIndex];
    this.columnStore.update(movedColumn.id, {
      name: movedColumn.name,
      position: event.currentIndex,
      boardId: movedColumn.boardId,
    });
  }

  protected onTaskDropped(event: CdkDragDrop<ITask[]>) {
    if (event.previousContainer === event.container) {
      this.reorderTask(event);
    } else {
      this.moveTaskToColumn(event);
    }
  }

  private reorderTask(event: CdkDragDrop<ITask[]>) {
    const tasksByColumn = { ...this.tasksByColumn() };
    const tasks = [...tasksByColumn[event.container.id]];
    moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    tasksByColumn[event.container.id] = tasks;
    this.taskStore.tasksByColumn.set(tasksByColumn);

    const movedTask = tasks[event.currentIndex];
    this.taskStore.update(movedTask.id, { ...movedTask, position: event.currentIndex });
  }

  private moveTaskToColumn(event: CdkDragDrop<ITask[]>) {
    const tasksByColumn = { ...this.tasksByColumn() };
    const prev = [...tasksByColumn[event.previousContainer.id]];
    const curr = [...tasksByColumn[event.container.id]];
    transferArrayItem(prev, curr, event.previousIndex, event.currentIndex);
    tasksByColumn[event.previousContainer.id] = prev;
    tasksByColumn[event.container.id] = curr;
    this.taskStore.tasksByColumn.set(tasksByColumn);

    const movedTask = curr[event.currentIndex];
    this.taskStore.update(movedTask.id, {
      ...movedTask,
      columnId: event.container.id,
      position: event.currentIndex,
    });
  }

  private loadBoard(boardId: string) {
    const boards = this.boardStore.boards();
    const found = boards.find((b) => b.id === boardId);

    if (found) {
      this.board.set(found);
    } else {
      this.boardStore.loadAll().then(() => {
        this.board.set(this.boardStore.boards().find((b) => b.id === boardId) ?? null);
      });
    }
  }
}
