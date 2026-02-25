import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { ColumnStore } from '@/shared/services/board/column/column.store';
import type { IColumn } from '@/shared/types/column.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'app-kanban-column-delete',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './kanban-column-delete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnDelete {
  private dialogService = inject(ZardDialogService);
  private columnStore = inject(ColumnStore);

  readonly column = input.required<IColumn>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Excluir coluna',
      zDescription: `Tem certeza que deseja excluir a coluna "${this.column().name}"? Todas as tarefas dentro dela serão removidas. Essa ação não pode ser desfeita.`,
      zOkText: 'Excluir',
      zOkDestructive: true,
      zWidth: '425px',
      zOnOk: () => {
        this.columnStore.delete(this.column().id);
      },
    });
  }
}
