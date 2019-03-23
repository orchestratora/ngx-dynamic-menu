import { Component, NgModule, NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { provideDynamicMenuExtras } from './dynamic-menu-extras';
import { provideDynamicMenuRoutes } from './dynamic-menu-routes';
import { DynamicMenuService } from './dynamic-menu.service';
import { provideSubMenuMap } from './sub-menu-map-provider';
import { DynamicMenuRouteConfig, RoutesWithMenu } from './types';

@Component({ selector: 'ndm-test', template: '' })
class TestComponent {}

@NgModule({
  declarations: [TestComponent],
  exports: [TestComponent]
})
class TestModule {}

describe('Service: DynamicMenu', () => {
  let destroyed$: Subject<void>;
  let untilDestroyed: ReturnType<typeof takeUntil>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule, RouterTestingModule.withRoutes([])],
      providers: [DynamicMenuService, provideDynamicMenuExtras({})]
    });

    destroyed$ = new Subject();
    untilDestroyed = takeUntil(destroyed$);
  });

  afterEach(() => destroyed$.next());

  it('should instantiate', () => {
    expect(getService()).toBeTruthy();
  });

  describe('getMenu() method', () => {
    it('should return observable of built menu config', fakeAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideDynamicMenuRoutes([
            { path: '', component: TestComponent }, // Should be skipped
            {
              path: 'route1',
              component: TestComponent,
              data: { menu: { label: 'Route 1' } },
              children: [
                {
                  path: 'route3',
                  component: TestComponent,
                  data: { menu: { label: 'Route 3' } }
                }
              ]
            },
            {
              path: 'route2',
              component: TestComponent,
              data: { menu: { label: 'Route 2' } }
            },
            { path: '**', redirectTo: '/', pathMatch: 'full' } // Should be skipped
          ])
        ]
      });

      const callback = jasmine.createSpy('callback');

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      expect(menu[0].path).toBe('route1');
      expect(menu[0].data.menu.label).toBe('Route 1');

      const subMenu = menu[0].data.menu.children;
      expect(subMenu.length).toBe(1);
      expect(subMenu[0].path).toBe('route3');
      expect(subMenu[0].data.menu.label).toBe('Route 3');

      expect(menu[1].path).toBe('route2');
      expect(menu[1].data.menu.label).toBe('Route 2');
    }));

    it('should resolve `data.menu.subMenuComponent` from map', fakeAsync(() => {
      class Comp1 {}
      class Comp2 {}

      TestBed.configureTestingModule({
        providers: [
          provideSubMenuMap('comp1', Comp1),
          provideSubMenuMap('comp2', Comp2),
          provideDynamicMenuRoutes([
            {
              path: 'route1',
              component: TestComponent,
              data: { menu: { label: 'Route 1', subMenuComponent: 'comp1' } },
              children: [
                {
                  path: 'route2',
                  component: TestComponent,
                  data: {
                    menu: { label: 'Route 2', subMenuComponent: 'comp2' }
                  }
                }
              ]
            }
          ])
        ]
      });

      const callback = jasmine.createSpy('callback');

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(1);

      expect(menu[0].path).toBe('route1');
      expect(menu[0].data.menu.label).toBe('Route 1');
      expect(menu[0].data.menu.subMenuComponent).toBe(Comp1);

      const subMenu = menu[0].data.menu.children;
      expect(subMenu.length).toBe(1);
      expect(subMenu[0].path).toBe('route2');
      expect(subMenu[0].data.menu.label).toBe('Route 2');
      expect(subMenu[0].data.menu.subMenuComponent).toBe(Comp2);
    }));

    it('should update menu when `listenForConfigChanges` is `true` and lazy module resolved', fakeAsync(() => {
      const childSubject$ = new Subject<any>();
      const childResolver = jasmine.createSpy().and.returnValue(childSubject$);
      const callback = jasmine.createSpy();

      const routes: RoutesWithMenu = [
        {
          path: '',
          component: TestComponent,
          data: { menu: { label: 'Main' } }
        },
        {
          path: 'child',
          loadChildren: childResolver,
          data: { menu: { label: 'Child' } }
        }
      ];

      @NgModule({
        imports: [TestModule, RouterTestingModule.withRoutes(routes)]
      })
      class TestRootModule {}

      const childRoutes: RoutesWithMenu = [
        {
          path: '',
          component: TestComponent,
          data: { menu: { label: 'Sub menu' } }
        }
      ];

      @NgModule({
        imports: [TestModule, RouterTestingModule.withRoutes(childRoutes)]
      })
      class ChildModule {}

      TestBed.configureTestingModule({
        imports: [TestRootModule],
        providers: [provideDynamicMenuExtras({ listenForConfigChanges: true })]
      });

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      expect(menu[0].path).toBe('');
      expect(menu[0].data.menu.label).toBe('Main');

      expect(menu[1].path).toBe('child');
      expect(menu[1].data.menu.label).toBe('Child');
      expect(menu[1].data.menu.children).toBeUndefined(); // Not yet loaded

      callback.calls.reset();

      const router = TestBed.get(Router) as Router;
      const ngZone = TestBed.get(NgZone) as NgZone;

      ngZone.run(() => router.navigateByUrl('/child'));
      tick();

      expect(childResolver).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();

      childSubject$.next(ChildModule);
      tick();

      expect(callback).toHaveBeenCalled();

      const newMenu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(newMenu.length).toBe(2);

      expect(newMenu[0].path).toBe('');
      expect(newMenu[0].data.menu.label).toBe('Main');

      expect(newMenu[1].path).toBe('child');
      expect(newMenu[1].data.menu.label).toBe('Child');

      const child1 = newMenu[1].data.menu.children;
      expect(child1.length).toBe(1); // Loaded!
      expect(child1[0].path).toBe('');
      expect(child1[0].data.menu.label).toBe('Sub menu');
    }));
  });

  describe('addMenuAfter() method', () => {
    beforeEach(() => {
      const routes: RoutesWithMenu = [
        {
          path: '',
          component: TestComponent,
          data: { menu: { label: 'Main' } }
        },
        {
          path: 'child',
          data: { menu: { label: 'Child' } },
          children: [
            {
              path: 'child1',
              component: TestComponent,
              data: { menu: { label: 'Child1' } }
            },
            {
              path: 'child2',
              component: TestComponent,
              data: { menu: { label: 'Child2' } }
            }
          ]
        }
      ];

      @NgModule({
        imports: [TestModule, RouterTestingModule.withRoutes(routes)]
      })
      class TestRootModule {}

      TestBed.configureTestingModule({
        imports: [TestRootModule]
      });
    });

    it('should insert custom menu after specified link', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService().addMenuAfter(['child', 'child1'], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      const child = menu[1].data.menu.children;

      expect(child.length).toBe(3);
      expect(child[0].path).toBe('child1');
      expect(child[1].path).toBe('custom');
      expect(child[2].path).toBe('child2');
    }));

    it('should update menu dynamically', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      callback.calls.reset();

      getService().addMenuAfter([''], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      tick();

      expect(callback).toHaveBeenCalled();

      const newMenu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(newMenu.length).toBe(3);
    }));
  });

  describe('addMenuToStart() method', () => {
    beforeEach(() => {
      const routes: RoutesWithMenu = [
        {
          path: '',
          component: TestComponent,
          data: { menu: { label: 'Main' } }
        },
        {
          path: 'child',
          data: { menu: { label: 'Child' } },
          children: [
            {
              path: 'child1',
              component: TestComponent,
              data: { menu: { label: 'Child1' } }
            },
            {
              path: 'child2',
              component: TestComponent,
              data: { menu: { label: 'Child2' } }
            }
          ]
        }
      ];

      @NgModule({
        imports: [TestModule, RouterTestingModule.withRoutes(routes)]
      })
      class TestRootModule {}

      TestBed.configureTestingModule({
        imports: [TestRootModule]
      });
    });

    it('should insert custom menu to start of link list', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService().addMenuToStart(['child', 'child2'], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      const child = menu[1].data.menu.children;

      expect(child.length).toBe(3);
      expect(child[0].path).toBe('custom');
      expect(child[1].path).toBe('child1');
      expect(child[2].path).toBe('child2');
    }));

    it('should update menu dynamically', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      callback.calls.reset();

      getService().addMenuToStart([''], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      tick();

      expect(callback).toHaveBeenCalled();

      const newMenu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(newMenu.length).toBe(3);
    }));
  });

  describe('addMenuToEnd() method', () => {
    beforeEach(() => {
      const routes: RoutesWithMenu = [
        {
          path: '',
          component: TestComponent,
          data: { menu: { label: 'Main' } }
        },
        {
          path: 'child',
          data: { menu: { label: 'Child' } },
          children: [
            {
              path: 'child1',
              component: TestComponent,
              data: { menu: { label: 'Child1' } }
            },
            {
              path: 'child2',
              component: TestComponent,
              data: { menu: { label: 'Child2' } }
            }
          ]
        }
      ];

      @NgModule({
        imports: [TestModule, RouterTestingModule.withRoutes(routes)]
      })
      class TestRootModule {}

      TestBed.configureTestingModule({
        imports: [TestRootModule]
      });
    });

    it('should insert custom menu to start of link list', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService().addMenuToEnd(['child', 'child1'], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      const child = menu[1].data.menu.children;

      expect(child.length).toBe(3);
      expect(child[0].path).toBe('child1');
      expect(child[1].path).toBe('child2');
      expect(child[2].path).toBe('custom');
    }));

    it('should update menu dynamically', fakeAsync(() => {
      const callback = jasmine.createSpy('callback');

      getService()
        .getMenu()
        .pipe(untilDestroyed)
        .subscribe(callback);

      tick();

      expect(callback).toHaveBeenCalled();

      const menu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(menu.length).toBe(2);

      callback.calls.reset();

      getService().addMenuToEnd([''], {
        path: 'custom',
        data: { menu: { label: 'Custom' } }
      });

      tick();

      expect(callback).toHaveBeenCalled();

      const newMenu = callback.calls.mostRecent()
        .args[0] as DynamicMenuRouteConfig[];

      expect(newMenu.length).toBe(3);
    }));
  });
});

function getService(): DynamicMenuService {
  return TestBed.get(DynamicMenuService);
}
