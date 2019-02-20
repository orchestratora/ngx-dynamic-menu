import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMenuTemplateContext } from '../context-template';
import { DynamicMenuItemsComponent } from './dynamic-menu-items.component';

@Component({
  selector: 'ndm-host',
  template: `
    <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
  `,
})
class HostComponent {
  getCtx = jasmine.createSpy('getCtx spy');
}

describe('DynamicMenuItemsComponent', () => {
  let hostComp: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicMenuItemsComponent, HostComponent],
    });
  });

  const init = async(async () => {
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;
  });

  describe('outside `DynamicMenuTemplateContext`', () => {
    beforeEach(init);

    it('should throw error on init', () => {
      expect(() => fixture.detectChanges()).toThrow();
    });
  });

  describe('in `DynamicMenuTemplateContext`', () => {
    beforeEach(done => {
      overrideHostTpl(`
        <ng-container *ngTemplateOutlet="comp; context: getCtx(tpl)"></ng-container>
        <ng-template #comp>
          <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
        </ng-template>
        <ng-template #tpl let-v>Tpl: {{ v }}</ng-template>
      `);

      init(done);
    });

    it('should NOT throw on init', () => {
      hostComp.getCtx.and.callFake(
        (tpl: any) => new DynamicMenuTemplateContext(tpl, {}),
      );

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should render tpl with context from `DynamicMenuTemplateContext`', () => {
      hostComp.getCtx.and.callFake(
        (tpl: any) => new DynamicMenuTemplateContext(tpl, { $implicit: 'var' }),
      );

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Tpl: var');
    });
  });
});

function overrideHostTpl(tpl: string) {
  TestBed.overrideTemplate(HostComponent, tpl);
}
