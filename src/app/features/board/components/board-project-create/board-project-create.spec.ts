import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardProjectCreate } from './board-project-create';

describe('BoardProjectCreate', () => {
  let component: BoardProjectCreate;
  let fixture: ComponentFixture<BoardProjectCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardProjectCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardProjectCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
