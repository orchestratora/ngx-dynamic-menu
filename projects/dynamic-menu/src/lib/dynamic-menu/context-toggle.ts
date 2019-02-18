import { TemplateRef } from '@angular/core';

import { DynamicMenuRouteConfig } from '../dynamic-menu.service';
import { DynamicMenuItemContext } from './context-item';

export class DynamicMenuToggleContext extends DynamicMenuItemContext {
  /** Flag that helps to control visibility of children, `false` by default */
  opened = false;

  constructor(
    /** Every computed route config */
    $implicit: DynamicMenuRouteConfig,
    tpl: TemplateRef<any>,
  ) {
    super($implicit, tpl);
  }
}
