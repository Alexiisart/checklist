import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Suprimir errores de extensiones del navegador
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes(
      'message channel closed before a response was received'
    )
  ) {
    event.preventDefault();
  }
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
