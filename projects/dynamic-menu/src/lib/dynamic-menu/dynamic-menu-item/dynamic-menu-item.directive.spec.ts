import { DynamicMenuItemDirective } from './dynamic-menu-item.directive';

describe('Directive: DynamicMenuItem', () => {
  it('should inject `TemplateRef` as `tplRef`', () => {
    const directive = new DynamicMenuItemDirective('tpl-ref' as any);
    expect(directive.tplRef).toBe('tpl-ref' as any);
  });
});
