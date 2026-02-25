import { Routes } from '@angular/router';
import { Board } from './features/board/board';
import { Kanban } from './features/kanban/kanban';

export const routes: Routes = [
  {
    path: '',
    component: Board,
  },
  {
    path: 'boards/:id',
    component: Kanban,
  },
];
