import { DynamicMenuToggleDirective } from './dynamic-menu-toggle.directive';

describe('Directive: DynamicMenuToggle', () => {
  it('should inject `TemplateRef` as `tplRef`', () => {
    const directive = new DynamicMenuToggleDirective('tpl-ref' as any);
    expect(directive.tplRef).toBeTruthy('tpl-ref' as any);
  });
});
