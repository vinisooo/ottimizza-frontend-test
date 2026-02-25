import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { ColumnStore } from '@/shared/services/board/column/column.store';
import type { IColumn, IColumnCreate } from '@/shared/types/column.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ColumnForm } from '../column-form/column-form';

@Component({
  selector: 'app-kanban-column-edit',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-column-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnEdit {
  private dialogService = inject(ZardDialogService);
  private columnStore = inject(ColumnStore);

  readonly column = input.required<IColumn>();

  openDialog() {
    const currentColumn = this.column();
    this.dialogService.create({
      zTitle: 'Editar coluna',
      zDescription: 'Altere o nome da coluna.',
      zContent: ColumnForm,
      zData: { name: currentColumn.name },
      zOkText: 'Salvar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name } = instance.form.getRawValue();
        const body: IColumnCreate = {
          name,
          position: currentColumn.position,
          boardId: currentColumn.boardId,
        };
        this.columnStore.update(currentColumn.id, body);
        return;
      },
    });
  }
}
