import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { urlLoader, suppressUnhandledRejection } from './exceptions';

// Detectar datos compartidos antes del bootstrap
urlLoader();

// Suprimir errores de extensiones del navegador
suppressUnhandledRejection();

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
