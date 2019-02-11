import { InjectionToken, Provider, Type } from '@angular/core';

/**
 * @internal
 */
export interface SubMenuMap {
  name: string;
  type: Type<any>;
}

/**
 * @internal
 */
export const SUB_MENU_MAP_TOKEN = new InjectionToken<SubMenuMap[]>(
  'SUB_MENU_MAP_TOKEN',
);

/**
 * @internal
 */
export function provideSubMenuMap(name: string, type: Type<any>): Provider {
  return { provide: SUB_MENU_MAP_TOKEN, useValue: { name, type }, multi: true };
}
