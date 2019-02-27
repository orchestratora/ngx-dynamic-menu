import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DefaultDynamicMenuComponentModule,
  DynamicMenuModule,
} from 'projects/dynamic-menu/src/public_api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Path3Component } from './path3.component';
import { PrintPathComponent } from './print-path/print-path.component';

@NgModule({
  imports: [
    BrowserModule,
    DynamicMenuModule.forRouter(),
    DefaultDynamicMenuComponentModule,
    AppRoutingModule,
  ],
  declarations: [AppComponent, PrintPathComponent, Path3Component],
  bootstrap: [AppComponent],
  providers: [],
})
export class AppModule {}
