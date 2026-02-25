import { inject } from '@angular/core';
import { type HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NetworkStatusService } from './network-status.service';

const API_DOWN_STATUSES = new Set([0, 502, 503, 504]);

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const networkStatus = inject(NetworkStatusService);

  if (!networkStatus.isOnline()) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 0,
          statusText: 'Offline',
          url: req.url,
        }),
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (API_DOWN_STATUSES.has(error.status)) {
        networkStatus.isOnline.set(false);
      }
      return throwError(() => error);
    }),
  );
};
