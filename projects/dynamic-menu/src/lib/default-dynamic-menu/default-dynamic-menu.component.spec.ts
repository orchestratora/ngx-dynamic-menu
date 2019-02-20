import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
  TemplateRef,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { DynamicMenuItemDirective } from '../dynamic-menu/dynamic-menu-item/dynamic-menu-item.directive';
import { DynamicMenuToggleDirective } from '../dynamic-menu/dynamic-menu-toggle/dynamic-menu-toggle.directive';
import { DynamicMenuWrapperDirective } from '../dynamic-menu/dynamic-menu-wrapper/dynamic-menu-wrapper.directive';
import { DefaultDynamicMenuComponent } from './default-dynamic-menu.component';

fdescribe('DefaultDynamicMenuComponent', () => {
  @Component({
    selector: 'ndm-dynamic-menu',
    template: `
      <ng-container *ngTemplateOutlet="tpl; context: ctx"></ng-container>
    `,
  })
  class DynamicMenuMockComponent {
    @ContentChild(DynamicMenuItemDirective) itemDir:
      | DynamicMenuItemDirective
      | undefined;
    @ContentChild(DynamicMenuWrapperDirective) wrapperDir:
      | DynamicMenuWrapperDirective
      | undefined;
    @ContentChild(DynamicMenuToggleDirective) toggleDir:
      | DynamicMenuToggleDirective
      | undefined;

    tpl: TemplateRef<any> | undefined;
    ctx: any;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        DefaultDynamicMenuComponent,
        DynamicMenuItemDirective,
        DynamicMenuToggleDirective,
        DynamicMenuWrapperDirective,
        DynamicMenuMockComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  let fixture: ComponentFixture<DefaultDynamicMenuComponent>;
  let component: DefaultDynamicMenuComponent;
  let dynamicMenuElem: DebugElement;
  let dynamicMenuComp: DynamicMenuMockComponent;
  let cdr: ChangeDetectorRef;

  const init = async(async () => {
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(DefaultDynamicMenuComponent);
    component = fixture.componentInstance;
    dynamicMenuElem = fixture.debugElement.query(
      By.directive(DynamicMenuMockComponent),
    );
    dynamicMenuComp = dynamicMenuElem.componentInstance;
    cdr = dynamicMenuElem.injector.get(ChangeDetectorRef);
  });

  describe('item template', () => {
    beforeEach(init);

    beforeEach(() => {
      fixture.detectChanges();
      // tslint:disable-next-line: no-non-null-assertion
      dynamicMenuComp.tpl = dynamicMenuComp.itemDir!.tplRef;
    });

    it('should render <a> with `fullUrl` and text `item.label`', () => {
      const config = { fullUrl: 'full-url' };
      const item = { label: 'label' };

      dynamicMenuComp.ctx = { $implicit: config, item };

      cdr.detectChanges();

      const aElem = dynamicMenuElem.query(By.css('a'));
      expect(aElem).toBeTruthy();
      expect(aElem.properties.href).toBe('/full-url');
      expect(aElem.nativeElement.textContent).toBe('label');
    });

    it('should render <ndm-dynamic-menu-items> after <a>', () => {
      dynamicMenuComp.ctx = { $implicit: {}, item: {} };

      cdr.detectChanges();

      const itemsElem = dynamicMenuElem.query(
        By.css('a + ndm-dynamic-menu-items'),
      );
      expect(itemsElem).toBeTruthy();
    });
  });

  describe('wrapper template', () => {
    beforeEach(init);

    beforeEach(() => {
      fixture.detectChanges();
      // tslint:disable-next-line: no-non-null-assertion
      dynamicMenuComp.tpl = dynamicMenuComp.wrapperDir!.tplRef;
    });

    it('should render <ul>', () => {
      cdr.detectChanges();

      const ulElem = dynamicMenuElem.query(By.css('ul'));
      expect(ulElem).toBeTruthy();
    });

    it('should render <ndm-dynamic-menu-items> inside <ul>', () => {
      cdr.detectChanges();

      const itemsElem = dynamicMenuElem.query(
        By.css('ul > ndm-dynamic-menu-items'),
      );
      expect(itemsElem).toBeTruthy();
    });
  });

  describe('toggle template', () => {
    beforeEach(init);

    beforeEach(() => {
      fixture.detectChanges();
      // tslint:disable-next-line: no-non-null-assertion
      dynamicMenuComp.tpl = dynamicMenuComp.toggleDir!.tplRef;
    });

    it('should render <button> with `item.label`', () => {
      dynamicMenuComp.ctx = { $implicit: {}, item: { label: 'label' } };

      cdr.detectChanges();

      const btnElem = dynamicMenuElem.query(By.css('button'));
      expect(btnElem).toBeTruthy();
      expect(btnElem.nativeElement.textContent).toBe('label');
    });

    describe('<ndm-dynamic-menu-items> after <button>', () => {
      it('should be rendered when `opened=true`', () => {
        dynamicMenuComp.ctx = {
          $implicit: {},
          item: { label: 'label' },
          opened: true,
        };

        cdr.detectChanges();

        const itemsElem = dynamicMenuElem.query(
          By.css('button ~ ndm-dynamic-menu-items'),
        );
        expect(itemsElem).toBeTruthy();
      });

      it('should NOT be rendered when `opened=false`', () => {
        dynamicMenuComp.ctx = {
          $implicit: {},
          item: { label: 'label' },
          opened: false,
        };

        cdr.detectChanges();

        const itemsElem = dynamicMenuElem.query(
          By.css('button ~ ndm-dynamic-menu-items'),
        );
        expect(itemsElem).toBeFalsy();
      });

      it('should toggle rendering when <button> clicked', () => {
        dynamicMenuComp.ctx = {
          $implicit: {},
          item: { label: 'label' },
          opened: false,
        };

        cdr.detectChanges();

        expect(
          dynamicMenuElem.query(By.css('button ~ ndm-dynamic-menu-items')),
        ).toBeFalsy();

        const btnElem = dynamicMenuElem.query(By.css('button'));
        btnElem.triggerEventHandler('click', {});

        cdr.detectChanges();

        expect(
          dynamicMenuElem.query(By.css('button ~ ndm-dynamic-menu-items')),
        ).toBeTruthy();
      });
    });
  });
});
