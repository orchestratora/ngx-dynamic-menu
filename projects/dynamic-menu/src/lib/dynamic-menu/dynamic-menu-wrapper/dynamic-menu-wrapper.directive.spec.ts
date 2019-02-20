import { DynamicMenuWrapperDirective } from './dynamic-menu-wrapper.directive';

describe('Directive: DynamicMenuWrapper', () => {
  it('should inject `TemplateRef` as `tplRef`', () => {
    const directive = new DynamicMenuWrapperDirective('tpl-ref' as any);
    expect(directive.tplRef).toBeTruthy('tpl-ref' as any);
  });
});
