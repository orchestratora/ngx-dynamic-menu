import { InjectionToken, Provider } from '@angular/core';
import { RoutesWithMenu } from './types';

/**
 * DI multi token that holds all routes with menu config
 * @internal
 */
export const DYNAMIC_MENU_ROUTES_TOKEN = new InjectionToken<RoutesWithMenu[]>(
  'DYNAMIC_MENU_ROUTES_TOKEN',
);

/**
 * Helper function to provide {@link DYNAMIC_MENU_ROUTES_TOKEN}
 * @internal
 */
export function provideDynamicMenuRoutes(routes: RoutesWithMenu): Provider {
  return { provide: DYNAMIC_MENU_ROUTES_TOKEN, useValue: routes, multi: true };
}
