import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DynamicMenuService } from '../dynamic-menu.service';
import { DynamicMenuItemDirective } from './dynamic-menu-item/dynamic-menu-item.directive';
import { DynamicMenuItemsComponent } from './dynamic-menu-items/dynamic-menu-items.component';
import { DynamicMenuToggleDirective } from './dynamic-menu-toggle/dynamic-menu-toggle.directive';
import { DynamicMenuWrapperDirective } from './dynamic-menu-wrapper/dynamic-menu-wrapper.directive';
import { DynamicMenuComponent } from './dynamic-menu.component';

class DynamicMenuServiceMock {
  getMenu = jasmine.createSpy('getMenu spy');
  isActive = jasmine.createSpy('isActive spy');
}

@Component({
  selector: 'ndm-host',
  template: `
    <ndm-dynamic-menu>
      <ul *ndmDynamicMenuWrapper>
        <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
      </ul>
      <li *ndmDynamicMenuItem="let config; let item = item">
        <a [routerLink]="config.fullUrl">{{ item.label }}</a>
        <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
      </li>
      <li *ndmDynamicMenuToggle="let item = item; let opened = opened">
        <button (click)="opened = !opened">{{ item.label }}</button>
        <ndm-dynamic-menu-items *ngIf="opened"></ndm-dynamic-menu-items>
      </li>
    </ndm-dynamic-menu>
  `,
})
class HostComponent {}

describe('DynamicMenuComponent', () => {
  let hostComp: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        DynamicMenuComponent,
        DynamicMenuItemsComponent,
        DynamicMenuItemDirective,
        DynamicMenuToggleDirective,
        DynamicMenuWrapperDirective,
        HostComponent,
      ],
      providers: [
        { provide: DynamicMenuService, useClass: DynamicMenuServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;
  });

  it('should render one level menu', () => {
    const menuService = TestBed.get(
      DynamicMenuService,
    ) as DynamicMenuServiceMock;

    menuService.getMenu.and.returnValue(
      of([
        {
          path: '',
          fullUrl: [''],
          data: { menu: { label: 'Home' } },
        },
        {
          path: 'path1',
          fullUrl: ['path1'],
          data: { menu: { label: 'Path 1' } },
        },
        {
          path: 'path2',
          fullUrl: ['path2'],
          data: { menu: { label: 'Path 2' } },
        },
      ]),
    );

    fixture.detectChanges();

    const ulElems = fixture.debugElement.queryAll(By.css('ul'));
    expect(ulElems.length).toBe(1);

    const liElems = ulElems[0].queryAll(By.css('li'));
    expect(liElems.length).toBe(3);

    const data = liElems.map(liElem => {
      const aElem = liElem.query(By.css('a'));
      expect(aElem).toBeTruthy();
      return {
        href: aElem.properties.href,
        label: aElem.nativeElement.textContent,
      };
    });

    expect(data).toEqual([
      { href: '/', label: 'Home' },
      { href: '/path1', label: 'Path 1' },
      { href: '/path2', label: 'Path 2' },
    ]);
  });
  it('should render one level menu', () => {
    const menuService = TestBed.get(
      DynamicMenuService,
    ) as DynamicMenuServiceMock;

    menuService.getMenu.and.returnValue(
      of([
        {
          path: '',
          fullUrl: [''],
          data: { menu: { label: 'Home' } },
        },
        {
          path: 'path1',
          fullUrl: ['path1'],
          data: { menu: { label: 'Path 1' } },
        },
        {
          path: 'path2',
          fullUrl: ['path2'],
          data: { menu: { label: 'Path 2' } },
        },
      ]),
    );

    fixture.detectChanges();

    const ulElems = fixture.debugElement.queryAll(By.css('ul'));
    expect(ulElems.length).toBe(1);

    const liElems = ulElems[0].queryAll(By.css('li'));
    expect(liElems.length).toBe(3);

    const data = liElems.map(liElem => {
      const aElem = liElem.query(By.css('a'));
      expect(aElem).toBeTruthy();
      return {
        href: aElem.properties.href,
        label: aElem.nativeElement.textContent,
      };
    });

    expect(data).toEqual([
      { href: '/', label: 'Home' },
      { href: '/path1', label: 'Path 1' },
      { href: '/path2', label: 'Path 2' },
    ]);
  });

  it('should render 3 level menu', () => {
    const menuService = TestBed.get(
      DynamicMenuService,
    ) as DynamicMenuServiceMock;

    menuService.getMenu.and.returnValue(
      of([
        {
          path: '',
          fullUrl: [''],
          data: { menu: { label: 'Home' } },
        },
        {
          path: 'path1',
          fullUrl: ['path1'],
          data: {
            menu: {
              label: 'Path 1',
              children: [
                {
                  path: 'c1',
                  fullUrl: ['path1', 'c1'],
                  data: {
                    menu: {
                      label: 'Children 1',
                      children: [
                        {
                          path: 'c11',
                          fullUrl: ['path1', 'c1', 'c11'],
                          data: { menu: { label: 'Children 1.1' } },
                        },
                        {
                          path: 'c12',
                          fullUrl: ['path1', 'c1', 'c12'],
                          data: { menu: { label: 'Children 1.2' } },
                        },
                      ],
                    },
                  },
                },
                {
                  path: 'c2',
                  fullUrl: ['path1', 'c2'],
                  data: { menu: { label: 'Children 2' } },
                },
              ],
            },
          },
        },
        {
          path: 'path2',
          fullUrl: ['path2'],
          data: { menu: { label: 'Path 2' } },
        },
      ]),
    );

    fixture.detectChanges();

    const ulElems = fixture.debugElement.queryAll(By.css('ul'));
    expect(ulElems.length).toBe(3);

    const liElems1 = ulElems[0].queryAll(By.css('li'));
    expect(liElems1.length).toBe(7);

    const liElems2 = ulElems[1].queryAll(By.css('li'));
    expect(liElems2.length).toBe(4);

    const liElems3 = ulElems[2].queryAll(By.css('li'));
    expect(liElems3.length).toBe(2);

    const data = liElems3.map(liElem => {
      const aElem = liElem.query(By.css('a'));
      expect(aElem).toBeTruthy();
      return {
        href: aElem.properties.href,
        label: aElem.nativeElement.textContent,
      };
    });

    expect(data).toEqual([
      { href: '/path1/c1/c11', label: 'Children 1.1' },
      { href: '/path1/c1/c12', label: 'Children 1.2' },
    ]);
  });

  it('should render toggle template if `renderAsToggle = true`', () => {
    const menuService = TestBed.get(
      DynamicMenuService,
    ) as DynamicMenuServiceMock;

    menuService.getMenu.and.returnValue(
      of([
        {
          path: 'path1',
          fullUrl: ['path1'],
          data: {
            menu: {
              label: 'Path 1',
              renderAsToggle: true,
              children: [
                {
                  path: 'c1',
                  fullUrl: ['path1', 'c1'],
                  data: { menu: { label: 'Children 1' } },
                },
              ],
            },
          },
        },
      ]),
    );

    fixture.detectChanges();

    const ulElem = fixture.debugElement.query(By.css('ul'));
    expect(ulElem).toBeTruthy();

    const btnElem = ulElem.query(By.css('button'));
    expect(btnElem).toBeTruthy();
    expect(btnElem.nativeElement.textContent).toBe('Path 1');
  });
});
