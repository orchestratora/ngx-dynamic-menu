import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DynamicMenuService } from '../../dynamic-menu.service';
import { DynamicMenuTemplateContext } from '../context-template';
import { DynamicMenuItemsComponent } from './dynamic-menu-items.component';

class DynamicMenuServiceMock {
  isActive = jasmine.createSpy('isActive spy');
}

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
      imports: [RouterTestingModule],
      declarations: [DynamicMenuItemsComponent, HostComponent],
      providers: [
        { provide: DynamicMenuService, useClass: DynamicMenuServiceMock },
      ],
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

    describe('`config.showChildrenIfActivated`', () => {
      describe('set to `true`', () => {
        beforeEach(() => {
          hostComp.getCtx.and.callFake(
            (tpl: any) =>
              new DynamicMenuTemplateContext(
                tpl,
                {},
                {
                  fullPath: 'full-path' as any,
                  fullUrl: 'full-url' as any,
                  data: {
                    menu: {
                      showChildrenIfActivated: true,
                      label: '',
                      children: [],
                    },
                  },
                },
              ),
          );
        });

        it('should call `dynamicMenuService.isActive()` with `config.fullUrl`', () => {
          fixture.detectChanges();

          expect(getDynamicMenuService().isActive).toHaveBeenCalledWith(
            'full-url',
          );
        });

        it('should render tpl if `dynamicMenuService.isActive` returns `true`', () => {
          getDynamicMenuService().isActive.and.returnValue(true);

          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('Tpl: ');
        });

        it('should NOT render tpl if `dynamicMenuService.isActive` returns `false`', () => {
          getDynamicMenuService().isActive.and.returnValue(false);

          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('');
        });
      });

      describe('set to `false`', () => {
        beforeEach(() => {
          hostComp.getCtx.and.callFake(
            (tpl: any) =>
              new DynamicMenuTemplateContext(
                tpl,
                {},
                {
                  fullPath: 'full-path' as any,
                  fullUrl: 'full-url' as any,
                  data: {
                    menu: {
                      showChildrenIfActivated: false,
                      label: '',
                      children: [],
                    },
                  },
                },
              ),
          );
        });

        it('should NOT call `dynamicMenuService.isActive()`', () => {
          fixture.detectChanges();

          expect(getDynamicMenuService().isActive).not.toHaveBeenCalled();
        });

        it('should always render tpl', () => {
          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('Tpl: ');
        });
      });
    });

    describe('`config.showChildrenIfChildActivated`', () => {
      describe('set to `true`', () => {
        beforeEach(() => {
          hostComp.getCtx.and.callFake(
            (tpl: any) =>
              new DynamicMenuTemplateContext(
                tpl,
                {},
                {
                  fullPath: 'full-path' as any,
                  fullUrl: 'full-url' as any,
                  data: {
                    menu: {
                      showChildrenIfChildActivated: true,
                      label: '',
                      children: [],
                    },
                  },
                },
              ),
          );
        });

        it('should call `dynamicMenuService.isActive()` with `config.fullUrl, true`', () => {
          fixture.detectChanges();

          expect(getDynamicMenuService().isActive).toHaveBeenCalledWith(
            'full-url',
            true,
          );
        });

        it('should call `dynamicMenuService.isActive()` with `config.fullUrl`', () => {
          fixture.detectChanges();

          expect(getDynamicMenuService().isActive).toHaveBeenCalledWith(
            'full-url',
          );
        });

        it('should render tpl if `dynamicMenuService.isActive` first returns `false` and second `true`', () => {
          getDynamicMenuService().isActive.and.returnValues(false, true);

          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('Tpl: ');
        });

        it('should NOT render tpl if `dynamicMenuService.isActive` first returns `true`', () => {
          getDynamicMenuService().isActive.and.returnValue(false);

          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('');
        });

        it('should NOT render tpl if `dynamicMenuService.isActive` second returns `false`', () => {
          getDynamicMenuService().isActive.and.returnValues(false, false);

          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('');
        });
      });

      describe('set to `false`', () => {
        beforeEach(() => {
          hostComp.getCtx.and.callFake(
            (tpl: any) =>
              new DynamicMenuTemplateContext(
                tpl,
                {},
                {
                  fullPath: 'full-path' as any,
                  fullUrl: 'full-url' as any,
                  data: {
                    menu: {
                      showChildrenIfChildActivated: false,
                      label: '',
                      children: [],
                    },
                  },
                },
              ),
          );
        });

        it('should NOT call `dynamicMenuService.isActive()`', () => {
          fixture.detectChanges();

          expect(getDynamicMenuService().isActive).not.toHaveBeenCalled();
        });

        it('should always render tpl', () => {
          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toBe('Tpl: ');
        });
      });
    });
  });
});

function overrideHostTpl(tpl: string) {
  TestBed.overrideTemplate(HostComponent, tpl);
}

function getDynamicMenuService(): DynamicMenuServiceMock {
  return TestBed.get(DynamicMenuService);
}
