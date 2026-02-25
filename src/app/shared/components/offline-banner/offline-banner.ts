import { NetworkStatusService } from '@/shared/offline/network-status.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ZardAlertComponent, ZardAlertTitleComponent, ZardAlertDescriptionComponent } from '@/shared/components/alert';

@Component({
  selector: 'app-offline-banner',
  imports: [ZardAlertComponent, ZardAlertTitleComponent, ZardAlertDescriptionComponent],
  templateUrl: './offline-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBanner {
  private networkStatus = inject(NetworkStatusService);

  protected isOffline = computed(() => !this.networkStatus.isOnline());
}
