import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardInputDirective } from '@/shared/components/input';
import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  imports: [ZardInputDirective, ZardButtonComponent, ZardIconComponent, ZardBadgeComponent],
  templateUrl: './tag-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInput),
      multi: true,
    },
  ],
})
export class TagInput implements ControlValueAccessor {
  readonly tags = signal<string[]>([]);
  readonly currentTag = signal('');

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.currentTag.set(value);
  }

  addTag() {
    const tag = this.currentTag().trim();
    if (!tag || this.tags().includes(tag)) return;

    this.tags.update((list) => [...list, tag]);
    this.currentTag.set('');
    this.onChange(this.tags());
    this.onTouched();
  }

  removeTag(index: number) {
    this.tags.update((list) => list.filter((_, i) => i !== index));
    this.onChange(this.tags());
    this.onTouched();
  }

  writeValue(value: string[]): void {
    this.tags.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
