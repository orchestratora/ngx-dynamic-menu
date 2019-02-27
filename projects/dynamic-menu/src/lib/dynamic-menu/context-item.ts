import { TemplateRef } from '@angular/core';

import { DynamicMenuRouteConfig } from '../types';
import { DynamicMenuTemplateContext } from './context-template';

export class DynamicMenuItemContext extends DynamicMenuTemplateContext {
  /** From every computed route config`s `data.menu` prop */
  item = this.$implicit.data.menu;

  constructor(
    /** Every computed route config */
    public $implicit: DynamicMenuRouteConfig,
    tpl: TemplateRef<any>,
  ) {
    super(tpl, { $implicit: $implicit.data.menu.children }, $implicit);
  }
}
