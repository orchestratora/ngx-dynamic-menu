import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ndmDynamicMenuItem]',
})
export class DynamicMenuItemDirective {
  constructor(public tplRef: TemplateRef<any>) {}
}
