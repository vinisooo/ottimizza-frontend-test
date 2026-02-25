import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardProject } from './board-project';

describe('BoardProject', () => {
  let component: BoardProject;
  let fixture: ComponentFixture<BoardProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardProject],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
