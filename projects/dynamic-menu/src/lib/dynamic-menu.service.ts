import { Injectable, Injector, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  Route,
  RouteConfigLoadEnd,
  Router
} from '@angular/router';
import { combineLatest, EMPTY, Subject, zip } from 'rxjs';
import {
  delay,
  filter,
  map,
  publishBehavior,
  refCount,
  scan,
  startWith,
  takeUntil
} from 'rxjs/operators';

import { DynamicMenuExtrasService } from './dynamic-menu-extras';
import { DYNAMIC_MENU_ROUTES_TOKEN } from './dynamic-menu-routes';
import { SubMenuMap, SubMenuMapToken } from './sub-menu-map-provider';
import {
  DynamicMenuConfigResolver,
  DynamicMenuRouteConfig,
  RoutesWithMenu,
  RouteWithMenu
} from './types';

export interface CustomMenu {
  location: string[];
  mode: 'insert' | 'start' | 'end';
  menu: RoutesWithMenu;
  used?: boolean;
}

export type AnyMenuRoute = RouteWithMenu | DynamicMenuRouteConfig;

export type MenuVisitor<T> = (
  node: AnyMenuRoute,
  parentNode?: AnyMenuRoute,
  acc?: AnyMenuRoute[]
) => { node: T; acc?: T[] };

@Injectable({
  providedIn: 'root'
})
export class DynamicMenuService implements OnDestroy {
  private destroyed$ = new Subject<void>();

  private addCustomMenu$ = new Subject<CustomMenu[]>();

  private customMenu$ = this.addCustomMenu$.pipe(
    scan((acc, customMenu) => [...acc, ...customMenu]),
    publishBehavior<CustomMenu[]>([]),
    refCount()
  );

  private configChanged$ = this.dynamicMenuExtrasService.listenForConfigChanges
    ? this.router.events.pipe(filter(e => e instanceof RouteConfigLoadEnd))
    : EMPTY;

  private navigationEnd$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd)
  );

  private dynamicMenuRoutes$ = this.configChanged$.pipe(
    startWith(null),
    map(() => this.getDynamicMenuRoutes())
  );

  private subMenuMap$ = this.getSubMenuMap();

  private basicMenu$ = zip(this.dynamicMenuRoutes$, this.subMenuMap$).pipe(
    delay(0),
    map(([routes, subMenuMap]) => this.buildFullUrlTree(routes, subMenuMap))
  );

  private fullMenu$ = combineLatest(
    this.basicMenu$,
    this.customMenu$,
    this.subMenuMap$
  ).pipe(
    map(([basicMenu, customMenu, subMenuMap]) =>
      this.resolveWithCustomMenu(basicMenu, customMenu, subMenuMap)
    )
  );

  private params$ = this.navigationEnd$.pipe(
    startWith(null),
    map(() => this.collectAllParams(this.router.routerState.root))
  );

  private dynamicMenu$ = combineLatest(this.fullMenu$, this.params$).pipe(
    map(([menu, params]) => this.updateFullPaths(menu, params)),
    publishBehavior([] as DynamicMenuRouteConfig[]),
    refCount()
  );

  constructor(
    private injector: Injector,
    private router: Router,
    private dynamicMenuExtrasService: DynamicMenuExtrasService
  ) {
    this.dynamicMenu$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  getMenu() {
    return this.dynamicMenu$;
  }

  isActive(fullPath: string[], exact = false) {
    return this.router.isActive(this.router.createUrlTree(fullPath), exact);
  }

  addMenuAfter(fullPath: string[], menu: RouteWithMenu | RoutesWithMenu) {
    this.addCustomMenu$.next([
      {
        location: fullPath,
        mode: 'insert',
        menu: Array.isArray(menu) ? menu : [menu]
      }
    ]);
  }

  addMenuToStart(fullPath: string[], menu: RouteWithMenu | RoutesWithMenu) {
    this.addCustomMenu$.next([
      {
        location: fullPath,
        mode: 'start',
        menu: Array.isArray(menu) ? menu : [menu]
      }
    ]);
  }

  addMenuToEnd(fullPath: string[], menu: RouteWithMenu | RoutesWithMenu) {
    this.addCustomMenu$.next([
      {
        location: fullPath,
        mode: 'end',
        menu: Array.isArray(menu) ? menu : [menu]
      }
    ]);
  }

  private getDynamicMenuRoutes(): RoutesWithMenu {
    return this.injector
      .get(DYNAMIC_MENU_ROUTES_TOKEN, [])
      .reduce((acc, routes) => [...acc, ...routes], this.router.config);
  }

  private getSubMenuMap() {
    return this.injector.get(SubMenuMapToken).get();
  }

  private resolveSubMenuComponent(
    config: RouteWithMenu,
    subMenuMap: SubMenuMap[]
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

  private updateFullPaths(
    menu: DynamicMenuRouteConfig[],
    params: Params
  ): DynamicMenuRouteConfig[] {
    if (!menu) {
      return menu;
    }

    return menu.map(m => {
      return {
        ...m,
        fullUrl: this.applyParams(m.fullPath, params),
        data: {
          ...m.data,
          menu: {
            ...m.data.menu,
            children: this.updateFullPaths(m.data.menu.children, params)
          }
        }
      };
    });
  }

  private applyParams(paths: string[], params: Params): string[] {
    if (!/:/.test(paths.join(''))) {
      return paths;
    }

    return paths.map(path =>
      path.startsWith(':') ? params[path.slice(1)] || path : path
    );
  }

  private collectAllParams(route: ActivatedRoute): Params {
    if (!route.snapshot) {
      return {};
    }

    let params = route.snapshot.params;

    route.children.forEach(
      child => (params = { ...params, ...this.collectAllParams(child) })
    );

    return params;
  }

  private resolveWithCustomMenu(
    basicMenu: DynamicMenuRouteConfig[],
    customMenu: CustomMenu[],
    subMenuMap: SubMenuMap[]
  ) {
    return this.combineMenuWithCustom(
      basicMenu,
      customMenu,
      (config, parentConfig) =>
        this.resolveMenuConfig(subMenuMap, config, parentConfig)
    );
  }

  private buildFullUrlTree(
    node: RoutesWithMenu,
    subMenuMap: SubMenuMap[]
  ): DynamicMenuRouteConfig[] {
    return this.buildUrlTree(node, (config, parentConfig) =>
      this.resolveMenuConfig(subMenuMap, config, parentConfig)
    );
  }

  private resolveMenuConfig(
    subMenuMap: SubMenuMap[],
    config: RouteWithMenu,
    parentConfig?: DynamicMenuRouteConfig
  ): DynamicMenuRouteConfig {
    const path = parentConfig
      ? parentConfig.fullPath || [parentConfig.path]
      : [];

    const subMenuComponent =
      config.data && config.data.menu
        ? this.resolveSubMenuComponent(config, subMenuMap)
        : undefined;

    // tslint:disable-next-line: no-non-null-assertion
    const fullPath: string[] = [...path, config.path!].filter(p => p != null);

    // Setting to `pathUrl` for now.
    // Will be updated later after navigation.
    const fullUrl: string[] = fullPath;

    return {
      ...config,
      fullPath,
      fullUrl,
      data: {
        ...config.data,
        menu: {
          label: '',
          children: undefined as any,
          ...(config.data && config.data.menu),
          subMenuComponent
        }
      }
    };
  }

  private buildUrlTree(
    node: (RouteWithMenu | DynamicMenuRouteConfig)[],
    fn: DynamicMenuConfigResolver
  ): DynamicMenuRouteConfig[] {
    return this.visitMenu(node, (config, configParent) => {
      return {
        node: fn(
          config as DynamicMenuRouteConfig,
          configParent as DynamicMenuRouteConfig
        )
      };
    });
  }

  private visitMenu<T extends AnyMenuRoute>(
    nodes: AnyMenuRoute[],
    cb: MenuVisitor<T>,
    parentNode?: AnyMenuRoute
  ): T[] {
    if (!nodes) {
      return [];
    }

    return nodes.reduce(
      (acc, node) => {
        const shouldSkip =
          !isConfigMenuItem(node) || this.shouldSkipConfig(node);

        const res = cb(node, parentNode, acc);

        const children: unknown =
          getMenuChildren(node) ||
          node.children ||
          getLoadedConfig(node) ||
          node.loadChildren;

        if (Array.isArray(children)) {
          if (shouldSkip) {
            if (isConfigMenuItem(parentNode)) {
              this.visitMenuChildren(parentNode, children, cb, res.node);
              return acc;
            } else if (isConfigMenuItem(res.node)) {
              const childrenInRoot = this.visitMenuChildren(
                res.node,
                children,
                cb,
              ) as T[] | undefined;

              if (childrenInRoot) {
                return res.acc
                  ? [...res.acc, ...childrenInRoot]
                  : [...acc, ...childrenInRoot];
              } else {
                return res.acc ? res.acc : acc;
              }
            }
          } else if (isConfigMenuItem(res.node)) {
            this.visitMenuChildren(res.node, children, cb);
          }
        }

        if (!shouldSkip) {
          return res.acc ? res.acc : [...acc, res.node];
        } else {
          return acc;
        }
      },
      [] as T[]
    );
  }

  private visitMenuChildren(
    node: AnyMenuRoute,
    children: AnyMenuRoute[],
    cb: MenuVisitor<AnyMenuRoute>,
    parentNode: AnyMenuRoute = node,
  ): AnyMenuRoute[] | undefined {
    const newChildren = this.visitMenu(children, cb, parentNode);

    if (!getMenuChildren(node) && newChildren.length) {
      setMenuChildren(node, newChildren as DynamicMenuRouteConfig[]);
    }

    return newChildren.length ? newChildren : undefined;
  }

  private combineMenuWithCustom(
    basicMenu: DynamicMenuRouteConfig[],
    customMenu: CustomMenu[],
    fn: DynamicMenuConfigResolver
  ): DynamicMenuRouteConfig[] {
    if (!customMenu.length) {
      return basicMenu;
    }

    return this.visitMenu(basicMenu, (node, parentNode, nodes) => {
      const newNodes = customMenu.reduce(
        (acc, customItem) => {
          if (customItem.used) {
            return acc;
          }

          const isStaticMode =
            customItem.mode === 'start' || customItem.mode === 'end';

          const isLocationMatch = isStaticMode
            ? acc.some(n => this.isMenuMatch(customItem, n))
            : this.isMenuMatch(customItem, node);

          if (!isLocationMatch) {
            return acc;
          }

          const children = isConfigMenuItem(parentNode)
            ? getMenuChildren(parentNode) || []
            : acc;

          const idxChildren =
            isStaticMode && !isConfigMenuItem(parentNode)
              ? basicMenu
              : children;

          const idx = idxChildren.findIndex(c => c === node);

          if (
            idx === -1 ||
            (customItem.mode === 'end' && idx !== idxChildren.length - 1)
          ) {
            return acc;
          }

          customItem.used = true;

          const menu = customItem.menu.map(m => {
            const p = {
              ...parentNode,
              fullPath: customItem.location.slice(0, -1)
            };
            return fn(m as any, p as any);
          });

          let newChildren = children;

          switch (customItem.mode) {
            case 'insert':
              newChildren = [
                ...children.slice(0, idx + 1),
                ...menu,
                ...children.slice(idx + 1)
              ];
              break;
            case 'start':
              newChildren = [...menu, ...children];
              break;
            case 'end':
              newChildren = [...children, ...menu];
              break;
          }

          if (isConfigMenuItem(parentNode)) {
            setMenuChildren(
              parentNode,
              newChildren as DynamicMenuRouteConfig[]
            );
            return acc;
          } else {
            return newChildren;
          }
        },
        [...(nodes || []), node] as AnyMenuRoute[]
      );

      return { node, acc: newNodes };
    }) as any;
  }

  private isMenuMatch(menu: CustomMenu, node: AnyMenuRoute): boolean {
    return (
      'fullPath' in node &&
      node.fullPath.length === menu.location.length &&
      node.fullPath.every((p, i) => menu.location[i] === p)
    );
  }
}

function getLoadedConfig(config: any) {
  return config._loadedConfig && config._loadedConfig.routes;
}

function isConfigMenuItem(config?: Route): config is RouteWithMenu {
  return config && config.data && config.data.menu;
}

function getMenuChildren(
  config?: RouteWithMenu
): DynamicMenuRouteConfig[] | undefined {
  return isConfigMenuItem(config) && config.data && config.data.menu
    ? (config.data.menu as any).children
    : undefined;
}

function setMenuChildren(
  config: RouteWithMenu,
  children: DynamicMenuRouteConfig[]
) {
  if (isConfigMenuItem(config) && config.data && config.data.menu) {
    (config.data.menu as any).children = children;
  }
}
