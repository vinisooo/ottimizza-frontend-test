import { ZardInputDirective } from '@/shared/components/input';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-board-form',
  imports: [ReactiveFormsModule, ZardInputDirective],
  templateUrl: './board-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardForm {
  private data = inject<{ name: string } | null>(Z_MODAL_DATA, { optional: true });

  form = new FormGroup({
    name: new FormControl(this.data?.name ?? '', { nonNullable: true, validators: [Validators.required] }),
  });
}
