import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { TaskStore } from '@/shared/services/board/task/task.store';
import type { ITaskCreate } from '@/shared/types/task.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-kanban-task-create',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-task-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanTaskCreate {
  private dialogService = inject(ZardDialogService);
  private taskStore = inject(TaskStore);

  readonly columnId = input.required<string>();
  readonly taskCount = input.required<number>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Criar tarefa',
      zDescription: 'Preencha os dados da nova tarefa.',
      zContent: TaskForm,
      zOkText: 'Criar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name, dueDate, tags } = instance.form.getRawValue();
        const body: ITaskCreate = {
          name,
          position: this.taskCount(),
          createdAt: new Date().toISOString(),
          dueDate: dueDate || '',
          completed: false,
          tags,
          columnId: this.columnId(),
        };
        this.taskStore.create(body);
        return;
      },
    });
  }
}
