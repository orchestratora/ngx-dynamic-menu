import { TemplateRef } from '@angular/core';

import { DynamicMenuRouteConfig } from '../types';
import { DynamicMenuTemplateContext } from './context-template';

export class DynamicMenuWrapperContext extends DynamicMenuTemplateContext {
  constructor(
    /** Array of route configurations that will be rendered */
    public $implicit: DynamicMenuRouteConfig[],
    tpl: TemplateRef<any>,
  ) {
    super(tpl, { $implicit });
  }
}
