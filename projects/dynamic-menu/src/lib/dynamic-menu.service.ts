import { Injectable, Injector } from '@angular/core';
import { Route, RouteConfigLoadEnd, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import {
  filter,
  map,
  publishBehavior,
  refCount,
  startWith,
} from 'rxjs/operators';

import { DynamicMenuExtrasToken } from './dynamic-menu-extras';
import { DYNAMIC_MENU_ROUTES_TOKEN } from './dynamic-menu-routes';
import { DataWithMenu, MenuItem, RoutesWithMenu, RouteWithMenu } from './types';

export interface DynamicMenuItem extends MenuItem {
  children: DynamicMenuRouteConfig[];
}

export interface DynamicDataWithMenu extends DataWithMenu {
  menu: DynamicMenuItem;
}

export interface DynamicMenuRouteConfig extends RouteWithMenu {
  data: DynamicDataWithMenu;
  fullUrl: string[];
}

export type DynamicMenuConfigFn = (
  config: DynamicMenuRouteConfig,
  parentConfig?: DynamicMenuRouteConfig,
) => DynamicMenuRouteConfig;

@Injectable({
  providedIn: 'root',
})
export class DynamicMenuService {
  private configChanged$ = this.dynamicMenuExtrasToken.listenForConfigChanges
    ? this.router.events.pipe(filter(e => e instanceof RouteConfigLoadEnd))
    : EMPTY;

  private dynamicMenuRoutes$ = this.configChanged$.pipe(
    startWith(null),
    map(() => this.getDynamicMenuRoutes()),
  );

  private dynamicMenu$ = this.dynamicMenuRoutes$.pipe(
    map(routes => this.buildFullUrlTree(routes)),
    publishBehavior([] as DynamicMenuRouteConfig[]),
    refCount(),
  );

  constructor(
    private injector: Injector,
    private router: Router,
    private dynamicMenuExtrasToken: DynamicMenuExtrasToken,
  ) {}

  getMenu() {
    return this.dynamicMenu$;
  }

  private getDynamicMenuRoutes() {
    return this.injector
      .get(DYNAMIC_MENU_ROUTES_TOKEN)
      .reduce((acc, routes) => [...acc, ...routes], []);
  }

  private shouldSkipConfig(config: RouteWithMenu) {
    return config.path === '**' || !!config.redirectTo;
  }

  private buildFullUrlTree(node: RoutesWithMenu): DynamicMenuRouteConfig[] {
    return this.buildUrlTree(node, (config, parentConfig) => {
      const path = parentConfig
        ? parentConfig.fullUrl || [parentConfig.path]
        : [];
      // tslint:disable-next-line: no-non-null-assertion
      config = { ...config, fullUrl: [...path, config.path!].filter(Boolean) };
      return config;
    });
  }

  private buildUrlTree(
    node: (Route | DynamicMenuRouteConfig)[],
    fn: DynamicMenuConfigFn,
  ): DynamicMenuRouteConfig[] {
    const getConfig = (
      config: DynamicMenuRouteConfig,
      parentConfig?: DynamicMenuRouteConfig,
    ) => {
      return fn(config, parentConfig);
    };
    return this._buildUrlTree(node, getConfig);
  }

  private _buildUrlTree(
    node: (Route | DynamicMenuRouteConfig)[],
    fn: DynamicMenuConfigFn,
    parentNode?: DynamicMenuRouteConfig,
  ): DynamicMenuRouteConfig[] {
    if (!node) {
      return [];
    }

    return node.reduce(
      (paths, config) => {
        const newNode = fn(config as DynamicMenuRouteConfig, parentNode);

        if (!isConfigMenuItem(config) || this.shouldSkipConfig(config)) {
          return [...paths, ...this.buildUrlTreeChild(config, fn, newNode)];
        } else if (typeof newNode === 'object') {
          newNode.data.menu.children = this.buildUrlTreeChild(
            config,
            fn,
            newNode,
          );
          return [...paths, newNode];
        } else {
          return [
            ...paths,
            newNode,
            ...this.buildUrlTreeChild(config, fn, newNode),
          ];
        }
      },
      [] as DynamicMenuRouteConfig[],
    );
  }

  private buildUrlTreeChild(
    config: Route | DynamicMenuRouteConfig,
    fn: DynamicMenuConfigFn,
    parentNode: DynamicMenuRouteConfig,
  ): DynamicMenuRouteConfig[] {
    const children = config.children || config.loadChildren;

    if (Array.isArray(children)) {
      return this._buildUrlTree(
        children as DynamicMenuRouteConfig[],
        fn,
        parentNode,
      );
    }

    return [];
  }
}

function isConfigMenuItem(config: Route): config is DynamicMenuRouteConfig {
  return config && config.data && config.data.menu;
}
