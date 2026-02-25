import { ZardButtonGroupComponent } from '@/shared/components/button-group';
import { ZardCardComponent } from '@/shared/components/card';
import type { IBoard } from '@/shared/types/board.type';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BoardProjectDelete } from '../board-project-delete/board-project-delete';
import { BoardProjectEdit } from '../board-project-edit/board-project-edit';

@Component({
  selector: 'app-board-project',
  imports: [ZardCardComponent, ZardButtonGroupComponent, BoardProjectEdit, BoardProjectDelete],
  templateUrl: './board-project.html',
})
export class BoardProject {
  private router = inject(Router);

  readonly board = input.required<IBoard>();

  onAccess() {
    this.router.navigate(['/boards', this.board().id]);
  }
}
