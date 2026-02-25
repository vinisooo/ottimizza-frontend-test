import { ZardInputDirective } from '@/shared/components/input';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { TagInput } from '@/shared/components/tag-input';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, ZardInputDirective, TagInput],
  templateUrl: './task-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  private data = inject<{ name: string; dueDate: string; tags: string[] } | null>(Z_MODAL_DATA, { optional: true });

  form = new FormGroup({
    name: new FormControl(this.data?.name ?? '', { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl(this.data?.dueDate ?? '', { nonNullable: true }),
    tags: new FormControl<string[]>(this.data?.tags ?? [], { nonNullable: true }),
  });
}
