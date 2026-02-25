import { NavBar } from '@/shared/components/nav-bar/nav-bar';
import { BoardStore } from '@/shared/services/board/board.store';
import { Component, inject, type OnInit } from '@angular/core';
import { BoardProject } from './components/board-project/board-project';
import { BoardProjectCreate } from './components/board-project-create/board-project-create';

@Component({
  selector: 'app-board',
  imports: [NavBar, BoardProject, BoardProjectCreate],
  templateUrl: './board.html',
})
export class Board implements OnInit {
  private boardStore = inject(BoardStore);
  protected boards = this.boardStore.boards;

  ngOnInit() {
    this.boardStore.loadAll();
  }
}
