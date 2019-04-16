import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicMenuItemDirective } from './dynamic-menu-item/dynamic-menu-item.directive';
import { DynamicMenuItemsComponent } from './dynamic-menu-items/dynamic-menu-items.component';
import { DynamicMenuToggleDirective } from './dynamic-menu-toggle/dynamic-menu-toggle.directive';
import { DynamicMenuWrapperDirective } from './dynamic-menu-wrapper/dynamic-menu-wrapper.directive';
import { DynamicMenuComponent } from './dynamic-menu.component';
import { MemoCompOutletDirective } from './memo-comp-outlet/memo-comp-outlet.directive';

@NgModule({
  imports: [CommonModule],
  exports: [
    DynamicMenuComponent,
    DynamicMenuItemsComponent,
    DynamicMenuWrapperDirective,
    DynamicMenuItemDirective,
    DynamicMenuToggleDirective,
  ],
  declarations: [
    DynamicMenuComponent,
    DynamicMenuItemsComponent,
    DynamicMenuWrapperDirective,
    DynamicMenuItemDirective,
    DynamicMenuToggleDirective,
    MemoCompOutletDirective,
  ],
})
export class DynamicMenuComponentModule {}
