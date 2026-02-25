import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { BoardStore } from '@/shared/services/board/board.store';
import type { IBoard } from '@/shared/types/board.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'app-board-project-delete',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './board-project-delete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardProjectDelete {
  private dialogService = inject(ZardDialogService);
  private boardStore = inject(BoardStore);

  readonly board = input.required<IBoard>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Excluir board',
      zDescription: `Tem certeza que deseja excluir o board "${this.board().name}"? Essa ação não pode ser desfeita.`,
      zOkText: 'Excluir',
      zOkDestructive: true,
      zWidth: '425px',
      zOnOk: () => {
        this.boardStore.delete(this.board().id);
      },
    });
  }
}
