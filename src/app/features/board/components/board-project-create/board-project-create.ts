import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogModule, ZardDialogService } from '@/shared/components/dialog';
import { ZardIconComponent } from '@/shared/components/icon';
import { BoardStore } from '@/shared/services/board/board.store';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BoardForm } from '../board-form/board-form';

@Component({
  selector: 'app-board-project-create',
  imports: [ZardButtonComponent, ZardIconComponent, ZardDialogModule],
  templateUrl: './board-project-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardProjectCreate {
  private dialogService = inject(ZardDialogService);
  private boardStore = inject(BoardStore);

  openDialog() {
    this.dialogService.create({
      zTitle: 'Criar board',
      zDescription: 'Insira o nome do novo board.',
      zContent: BoardForm,
      zOkText: 'Criar',
      zWidth: '425px',
      zOnOk: (instance) => {
        if (instance.form.invalid) return false;
        const { name } = instance.form.getRawValue();
        this.boardStore.create({ name });
        return;
      },
    });
  }
}
