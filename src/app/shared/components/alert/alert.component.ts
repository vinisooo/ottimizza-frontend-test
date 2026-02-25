import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '@/shared/utils/merge-classes';
import { alertVariants, type ZardAlertTypeVariants } from './alert.variants';

@Component({
  selector: 'z-alert',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'alert',
    '[class]': 'classes()',
  },
  exportAs: 'zAlert',
})
export class ZardAlertComponent {
  readonly zType = input<ZardAlertTypeVariants>('default');
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() =>
    mergeClasses(alertVariants({ zType: this.zType() }), this.class()),
  );
}

@Component({
  selector: 'z-alert-title',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'alert-title',
    '[class]': '"col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight"',
  },
})
export class ZardAlertTitleComponent {}

@Component({
  selector: 'z-alert-description',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'alert-description',
    '[class]': '"col-start-2 text-sm [&_p]:leading-relaxed text-muted-foreground"',
  },
})
export class ZardAlertDescriptionComponent {}
