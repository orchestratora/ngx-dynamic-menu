import { TemplateRef } from '@angular/core';

import { DynamicMenuRouteConfig } from '../types';

export class DynamicMenuTemplateContext {
  constructor(
    /** Reference to template with children items */
    public tpl: TemplateRef<any>,
    /** Context for {@link TemplateRef} `tpl` */
    public ctx: any,
    /**
     * @internal
     * Parent route config to determine if template should be rendered
     */
    public parentConfig?: DynamicMenuRouteConfig
  ) {}
}
