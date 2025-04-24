import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Force production mode when not on localhost
if (window.location.hostname !== 'localhost') {
  console.log('Forcing production mode for deployment');
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
