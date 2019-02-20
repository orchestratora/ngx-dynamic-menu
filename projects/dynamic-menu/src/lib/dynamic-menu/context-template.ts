import { TemplateRef } from '@angular/core';

export class DynamicMenuTemplateContext {
  constructor(
    /** Reference to template with children items */
    public tpl: TemplateRef<any>,
    /** Context for {@link TemplateRef} `tpl` */
    public ctx: any,
  ) {}
}
