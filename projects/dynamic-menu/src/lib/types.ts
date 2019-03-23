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
  /**
   * Will render `dynamicMenuToggle` template for menu item
   */
  renderAsToggle?: boolean;
}

export interface DataWithMenu extends Data {
  menu?: MenuItem;
}

export interface RouteWithMenu extends Route {
  data?: DataWithMenu;
}

export interface RoutesWithMenu extends Array<RouteWithMenu> {}

export interface DynamicMenuItem extends MenuItem {
  subMenuComponent?: Type<any>;
  children: DynamicMenuRouteConfig[];
}

export interface DynamicDataWithMenu extends DataWithMenu {
  menu: DynamicMenuItem;
}

export interface DynamicMenuRouteConfig extends RouteWithMenu {
  data: DynamicDataWithMenu;
  /**
   * Represents unprocessed full path from root to route.
   * Only calculated once a router config is (re)loaded.
   */
  fullPath: string[];
  /**
   * Represents processed full path from root to route.
   * It updates with every navigation.
   */
  fullUrl: string[];
}

export type DynamicMenuConfigResolver = (
  config: RouteWithMenu,
  parentConfig?: DynamicMenuRouteConfig
) => DynamicMenuRouteConfig;
