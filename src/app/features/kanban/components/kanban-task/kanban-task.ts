import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardIconComponent } from '@/shared/components/icon';
import type { ITask } from '@/shared/types/task.type';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { KanbanTaskEdit } from '../kanban-task-edit/kanban-task-edit';
import { KanbanTaskDelete } from '../kanban-task-delete/kanban-task-delete';

@Component({
  selector: 'app-kanban-task',
  imports: [CdkDrag, ZardIconComponent, ZardBadgeComponent, KanbanTaskEdit, KanbanTaskDelete],
  templateUrl: './kanban-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanTask {
  readonly task = input.required<ITask>();
  readonly columnId = input.required<string>();
}
