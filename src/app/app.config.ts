import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideZard } from '@/shared/core/provider/providezard';
import { offlineInterceptor } from '@/shared/offline/offline.interceptor';
import { SyncEngineService } from '@/shared/offline/sync-engine.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([offlineInterceptor])),
    provideRouter(routes),
    provideZard(),
    provideAppInitializer(() => {
      inject(SyncEngineService);
    }),
  ],
};
