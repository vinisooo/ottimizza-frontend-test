import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { BoardStore } from '@/shared/services/board/board.store';
import type { IBoard } from '@/shared/types/board.type';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BoardForm } from '../board-form/board-form';

@Component({
  selector: 'app-board-project-edit',
  imports: [ZardButtonComponent, ZardDialogModule],
  templateUrl: './board-project-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardProjectEdit {
  private dialogService = inject(ZardDialogService);
  private boardStore = inject(BoardStore);

  readonly board = input.required<IBoard>();

  openDialog() {
    this.dialogService.create({
      zTitle: 'Editar board',
      zDescription: 'Altere o nome do board.',
      zContent: BoardForm,
      zData: { name: this.board().name },
      zOkText: 'Salvar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name } = instance.form.getRawValue();
        this.boardStore.update(this.board().id, { name });
        return;
      },
    });
  }
}
