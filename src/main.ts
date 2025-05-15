import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/services/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import { appConfig } from './app/app.config';
import { inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);


bootstrapApplication(AppComponent, appConfig).then(() => {
  const dateAdapter = inject(DateAdapter);
  dateAdapter.setLocale('fr-FR');
  [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN' })
    )
    
  ]
})
