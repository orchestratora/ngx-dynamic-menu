import { Injectable, Injector } from '@angular/core';
import { Route, RouteConfigLoadEnd, Router } from '@angular/router';
import { EMPTY, zip } from 'rxjs';
import {
  delay,
  filter,
  map,
  publishBehavior,
  refCount,
  startWith,
} from 'rxjs/operators';

import { DynamicMenuExtrasToken } from './dynamic-menu-extras';
import { DYNAMIC_MENU_ROUTES_TOKEN } from './dynamic-menu-routes';
import { SUB_MENU_MAP_TOKEN, SubMenuMap } from './sub-menu-map-provider';
import {
  DynamicMenuConfigFn,
  DynamicMenuRouteConfig,
  RoutesWithMenu,
  RouteWithMenu,
} from './types';

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

  private subMenuMap$ = this.configChanged$.pipe(
    startWith(null),
    map(() => this.getSubMenuMap()),
  );

  private dynamicMenu$ = zip(this.dynamicMenuRoutes$, this.subMenuMap$).pipe(
    delay(0),
    map(([routes, subMenuMap]) => this.buildFullUrlTree(routes, subMenuMap)),
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

  isActive(fullPath: string[], exact = false) {
    return this.router.isActive(this.router.createUrlTree(fullPath), exact);
  }

  private getDynamicMenuRoutes() {
    return this.injector
      .get(DYNAMIC_MENU_ROUTES_TOKEN, [])
      .reduce((acc, routes) => [...acc, ...routes], this.router.config);
  }

  private getSubMenuMap() {
    return this.injector.get(SUB_MENU_MAP_TOKEN, []);
  }

  private resolveSubMenuComponent(
    config: RouteWithMenu,
    subMenuMap: SubMenuMap[],
  ) {
    if (!config.data || !config.data.menu) {
      return;
    }

    const name = config.data.menu.subMenuComponent;

    if (typeof name === 'string') {
      const info = subMenuMap.find(m => m.name === name);

      if (!info) {
        console.warn(`DynamicMenuService: Could not resolve sub-menu component string ${name}!
        Please make sure to provide mapping via 'DynamicMenuModule.provideSubMenu()'`);
        return;
      }

      return info.type;
    }

    return name;
  }

  private shouldSkipConfig(config: RouteWithMenu) {
    return config.path === '**' || !!config.redirectTo;
  }

  private buildFullUrlTree(
    node: RoutesWithMenu,
    subMenuMap: SubMenuMap[],
  ): DynamicMenuRouteConfig[] {
    return this.buildUrlTree(node, (config, parentConfig) => {
      const path = parentConfig
        ? parentConfig.fullUrl || [parentConfig.path]
        : [];

      if (config.data && config.data.menu) {
        config.data.menu.subMenuComponent = this.resolveSubMenuComponent(
          config,
          subMenuMap,
        );
      }

      return {
        ...config,
        // tslint:disable-next-line: no-non-null-assertion
        fullUrl: [...path, config.path!].filter(p => p != null),
      };
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

    const usedPaths = {} as any;

    return node.reduce(
      (paths, config) => {
        if (config.path != null) {
          if (config.path in usedPaths) {
            return paths;
          }
          usedPaths[config.path] = true;
        }

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
    const children =
      config.children || getLoadedConfig(config) || config.loadChildren;

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

function getLoadedConfig(config: any) {
  return config._loadedConfig && config._loadedConfig.routes;
}

function isConfigMenuItem(config: Route): config is DynamicMenuRouteConfig {
  return config && config.data && config.data.menu;
}
