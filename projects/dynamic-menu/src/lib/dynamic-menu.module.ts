import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  DynamicMenuExtras,
  provideDynamicMenuExtras,
} from './dynamic-menu-extras';
import { provideDynamicMenuRoutes } from './dynamic-menu-routes';
import { RoutesWithMenu } from './types';

@NgModule({
  declarations: [],
  imports: [RouterModule],
  exports: [],
})
export class DynamicMenuModule {
  /**
   * Provides module with routes that have config for menu
   *
   * Same as {@link Routes} from `@angular/router` but with extra data property
   *
   * @see RoutesWithMenu
   */
  static withRoutes(
    routes: RoutesWithMenu,
    extras: DynamicMenuExtras = {},
  ): ModuleWithProviders {
    return {
      ngModule: DynamicMenuModule,
      providers: [
        provideDynamicMenuExtras(extras),
        provideDynamicMenuRoutes(routes),
      ],
    };
  }
}
