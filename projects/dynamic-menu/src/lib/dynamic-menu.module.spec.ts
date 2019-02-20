import { ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import { DynamicMenuExtrasToken } from './dynamic-menu-extras';
import { DYNAMIC_MENU_ROUTES_TOKEN } from './dynamic-menu-routes';
import { DynamicMenuModule } from './dynamic-menu.module';
import { SUB_MENU_MAP_TOKEN } from './sub-menu-map-provider';

describe('Module: DynamicMenu', () => {
  it('should exist', () => {
    expect(DynamicMenuModule).toBeTruthy();
  });

  describe('static forRouter()', () => {
    it('should return same ngModule', () => {
      const res = DynamicMenuModule.forRouter();

      expect(res.ngModule).toBe(DynamicMenuModule);
    });

    it('should provide `DYNAMIC_MENU_ROUTES_TOKEN` multi token with `[]` as useValue', () => {
      const res = DynamicMenuModule.forRouter();

      expect(res.providers as any).toEqual(
        jasmine.arrayContaining([
          { provide: DYNAMIC_MENU_ROUTES_TOKEN, useValue: [], multi: true },
        ]),
      );
    });

    it('should provide `DynamicMenuExtrasToken` token with `extras` as useValue', () => {
      const extras = { listenForConfigChanges: true };
      const res = DynamicMenuModule.forRouter(extras);

      expect(res.providers as any).toEqual(
        jasmine.arrayContaining([
          {
            provide: DynamicMenuExtrasToken,
            useValue: jasmine.objectContaining(extras),
          },
        ]),
      );
    });
  });

  describe('static withRoutes()', () => {
    it('should return same ngModule', () => {
      const res = DynamicMenuModule.withRoutes([]);

      expect(res.ngModule).toBe(DynamicMenuModule);
    });

    it('should provide `DYNAMIC_MENU_ROUTES_TOKEN` multi token with `routes` as useValue', () => {
      const routes: any = ['routes'];
      const res = DynamicMenuModule.withRoutes(routes);

      expect(res.providers).toEqual(jasmine.any(Array));
      expect(res.providers as any).toEqual(
        jasmine.arrayContaining([
          { provide: DYNAMIC_MENU_ROUTES_TOKEN, useValue: routes, multi: true },
        ]),
      );
    });

    it('should provide `DynamicMenuExtrasToken` token with `extras` as useValue', () => {
      const extras = { listenForConfigChanges: true };
      const res = DynamicMenuModule.withRoutes([], extras);

      expect(res.providers).toEqual(jasmine.any(Array));
      expect(res.providers as any).toEqual(
        jasmine.arrayContaining([
          {
            provide: DynamicMenuExtrasToken,
            useValue: jasmine.objectContaining(extras),
          },
        ]),
      );
    });
  });

  describe('static provideSubMenu()', () => {
    it('should provide `ANALYZE_FOR_ENTRY_COMPONENTS` multi token with `component` as useValue', () => {
      const comp = {} as any;
      const providers = DynamicMenuModule.provideSubMenu('', comp);

      expect(providers as any).toEqual(
        jasmine.arrayContaining([
          {
            provide: ANALYZE_FOR_ENTRY_COMPONENTS,
            useValue: comp,
            multi: true,
          },
        ]),
      );
    });

    it('should provide `SUB_MENU_MAP_TOKEN` multi token with `{ name, type }` as useValue', () => {
      const comp = {} as any;
      const providers = DynamicMenuModule.provideSubMenu('name', comp);

      expect(providers as any).toEqual(
        jasmine.arrayContaining([
          {
            provide: SUB_MENU_MAP_TOKEN,
            useValue: jasmine.objectContaining({ name: 'name', type: comp }),
            multi: true,
          },
        ]),
      );
    });
  });
});
