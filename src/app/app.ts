import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineBanner } from '@/shared/components/offline-banner/offline-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OfflineBanner],
  templateUrl: './app.html',
})
export class App {}
