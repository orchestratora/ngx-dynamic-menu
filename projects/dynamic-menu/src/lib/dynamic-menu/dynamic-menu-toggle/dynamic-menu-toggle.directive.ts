import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ndmDynamicMenuToggle]',
})
export class DynamicMenuToggleDirective {
  constructor(public tplRef: TemplateRef<any>) {}
}
