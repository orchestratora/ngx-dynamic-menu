import { Type } from '@angular/core';
import { Route, Data } from '@angular/router';

export interface MenuItem {
  /**
   * Label for menu item
   */
  label: string;
  /**
   * Icon for menu item
   */
  icon?: string;
  /**
   * Make item not a navigation link but only reveal it's children links
   */
  justToggleChildren?: true;
  /**
   * Only show children items if route is being activated
   */
  showChildrenIfActivated?: boolean;
  /**
   * Same as {@link MenuItem.showChildrenIfActivated} but match route with exact method
   */
  showChildrenIfChildActivated?: boolean;
  /**
   * Render custom component between item and sub-items when route activated
   *
   * Visibility affected by {@link MenuItem.showChildrenIfActivated}
   * and {@link MenuItem.showChildrenIfActivatedExact}
   */
  subMenuComponent?: Type<any> | string;
}

export interface DataWithMenu extends Data {
  menu?: MenuItem;
}

export interface RouteWithMenu extends Route {
  data?: DataWithMenu;
}

export interface RoutesWithMenu extends Array<RouteWithMenu> {}
