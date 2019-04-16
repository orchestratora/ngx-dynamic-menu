import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DynamicMenuComponentModule } from '../dynamic-menu/dynamic-menu.module';
import { DefaultDynamicMenuComponent } from './default-dynamic-menu.component';

@NgModule({
  imports: [CommonModule, RouterModule, DynamicMenuComponentModule],
  exports: [DefaultDynamicMenuComponent],
  declarations: [DefaultDynamicMenuComponent]
})
export class DefaultDynamicMenuComponentModule {}
