import { ZardIconComponent } from '@/shared/components/icon';
import { ZardButtonGroupComponent } from '@/shared/components/button-group';
import type { IColumn } from '@/shared/types/column.type';
import type { ITask } from '@/shared/types/task.type';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragHandle, CdkDropList, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanTask } from '../kanban-task/kanban-task';
import { KanbanTaskCreate } from '../kanban-task-create/kanban-task-create';
import { KanbanColumnEdit } from '../kanban-column-edit/kanban-column-edit';
import { KanbanColumnDelete } from '../kanban-column-delete/kanban-column-delete';

@Component({
  selector: 'app-kanban-column',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    ZardIconComponent,
    ZardButtonGroupComponent,
    KanbanTask,
    KanbanTaskCreate,
    KanbanColumnEdit,
    KanbanColumnDelete,
  ],
  templateUrl: './kanban-column.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumn {
  readonly column = input.required<IColumn>();
  readonly tasks = input.required<ITask[]>();
  readonly connectedTo = input<string[]>([]);
  readonly taskDropped = output<CdkDragDrop<ITask[]>>();

  onDrop(event: CdkDragDrop<ITask[]>) {
    this.taskDropped.emit(event);
  }
}
