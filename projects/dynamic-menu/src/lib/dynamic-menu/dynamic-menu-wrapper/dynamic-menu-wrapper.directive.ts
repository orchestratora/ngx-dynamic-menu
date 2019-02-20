import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ndmDynamicMenuWrapper]',
})
export class DynamicMenuWrapperDirective {
  constructor(public tplRef: TemplateRef<any>) {}
}
