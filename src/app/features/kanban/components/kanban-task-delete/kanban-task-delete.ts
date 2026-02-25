import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { TaskStore } from '@/shared/services/board/task/task.store';
import type { ITask } from '@/shared/types/task.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'app-kanban-task-delete',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-task-delete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanTaskDelete {
  private dialogService = inject(ZardDialogService);
  private taskStore = inject(TaskStore);

  readonly task = input.required<ITask>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Excluir tarefa',
      zDescription: `Tem certeza que deseja excluir a tarefa "${this.task().name}"? Essa ação não pode ser desfeita.`,
      zOkText: 'Excluir',
      zOkDestructive: true,
      zWidth: '425px',
      zOnOk: () => {
        this.taskStore.delete(this.task().id);
      },
    });
  }
}
