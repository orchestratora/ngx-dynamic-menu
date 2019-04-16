import { InjectionToken, Provider, Type } from '@angular/core';

import { createLazyToken } from './lazy-token';

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
  'SUB_MENU_MAP_TOKEN'
);

const subMenuMapLazyToken = createLazyToken(SUB_MENU_MAP_TOKEN);

/**
 * @internal
 */
export const SubMenuMapToken = subMenuMapLazyToken.getServiceType();

/**
 * @internal
 */
export function provideSubMenuMap(name: string, type: Type<any>): Provider[] {
  return subMenuMapLazyToken.provideValue({ name, type });
}
