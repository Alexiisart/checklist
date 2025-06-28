import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { FirebaseAuthService } from './services/firebase/firebase-auth.service';
import { FirebaseStorageService } from './services/firebase/firebase-storage.service';
import { FirebaseMigrationService } from './services/firebase/firebase-migration.service';
import { FirebaseSyncService } from './services/firebase/firebase-sync.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    FirebaseAuthService,
    FirebaseStorageService,
    FirebaseMigrationService,
    FirebaseSyncService,
  ],
};
