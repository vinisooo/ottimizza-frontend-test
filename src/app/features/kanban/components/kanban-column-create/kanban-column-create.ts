import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { ColumnStore } from '@/shared/services/board/column/column.store';
import type { IColumnCreate } from '@/shared/types/column.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ColumnForm } from '../column-form/column-form';

@Component({
  selector: 'app-kanban-column-create',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-column-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnCreate {
  private dialogService = inject(ZardDialogService);
  private columnStore = inject(ColumnStore);

  readonly boardId = input.required<string>();
  readonly columnCount = input.required<number>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Criar coluna',
      zDescription: 'Insira o nome da nova coluna.',
      zContent: ColumnForm,
      zOkText: 'Criar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name } = instance.form.getRawValue();
        const body: IColumnCreate = {
          name,
          position: this.columnCount(),
          boardId: this.boardId(),
        };
        this.columnStore.create(body);
        return;
      },
    });
  }
}
