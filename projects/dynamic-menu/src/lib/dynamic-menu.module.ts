import { CommonModule } from '@angular/common';
import {
  ANALYZE_FOR_ENTRY_COMPONENTS,
  ModuleWithProviders,
  NgModule,
  Provider,
  Type,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { DynamicMenuComponentModule } from './dynamic-menu';
import {
  DynamicMenuExtras,
  provideDynamicMenuExtras,
} from './dynamic-menu-extras';
import { provideDynamicMenuRoutes } from './dynamic-menu-routes';
import { provideSubMenuMap } from './sub-menu-map-provider';
import { RoutesWithMenu } from './types';

@NgModule({
  imports: [CommonModule, RouterModule, DynamicMenuComponentModule],
  exports: [DynamicMenuComponentModule],
})
export class DynamicMenuModule {
  /**
   * Provides module that will take menu config from Router config
   */
  static forRouter(extras?: DynamicMenuExtras): ModuleWithProviders {
    return {
      ngModule: DynamicMenuModule,
      providers: [
        provideDynamicMenuExtras({ listenForConfigChanges: true, ...extras }),
        provideDynamicMenuRoutes([]),
      ],
    };
  }

  /**
   * Provides module with routes that have config for menu
   *
   * Same as {@link Routes} from `@angular/router` but with extra data property
   *
   * @see RoutesWithMenu
   */
  static withRoutes(
    routes: RoutesWithMenu,
    extras?: DynamicMenuExtras,
  ): ModuleWithProviders {
    return {
      ngModule: DynamicMenuModule,
      providers: [
        provideDynamicMenuExtras(extras),
        provideDynamicMenuRoutes(routes),
      ],
    };
  }

  /**
   * Use this method to provide mapping for components used in sub menus
   *
   * If they are referenced with string for lazy-loading purpose then
   * this provider is required for that to work
   */
  static provideSubMenu(name: string, component: Type<any>): Provider[] {
    return [
      {
        provide: ANALYZE_FOR_ENTRY_COMPONENTS,
        useValue: component,
        multi: true,
      },
      provideSubMenuMap(name, component),
    ];
  }
}
