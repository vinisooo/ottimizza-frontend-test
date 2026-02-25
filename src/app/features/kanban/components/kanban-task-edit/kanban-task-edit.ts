import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { TaskStore } from '@/shared/services/board/task/task.store';
import type { ITask, ITaskCreate } from '@/shared/types/task.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-kanban-task-edit',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-task-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanTaskEdit {
  private dialogService = inject(ZardDialogService);
  private taskStore = inject(TaskStore);

  readonly task = input.required<ITask>();
  readonly columnId = input.required<string>();

  openDialog() {
    const currentTask = this.task();
    this.dialogService.create({
      zTitle: 'Editar tarefa',
      zDescription: 'Altere os dados da tarefa.',
      zContent: TaskForm,
      zData: {
        name: currentTask.name,
        dueDate: currentTask.dueDate,
        tags: currentTask.tags,
      },
      zOkText: 'Salvar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name, dueDate, tags } = instance.form.getRawValue();
        const body: ITaskCreate = {
          name,
          position: currentTask.position,
          createdAt: currentTask.createdAt,
          dueDate: dueDate || '',
          completed: currentTask.completed,
          tags,
          columnId: this.columnId(),
        };
        this.taskStore.update(currentTask.id, body);
        return;
      },
    });
  }
}
