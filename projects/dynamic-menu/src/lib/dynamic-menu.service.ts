import { Injectable, Injector } from '@angular/core';
import { RouteConfigLoadEnd, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { DynamicMenuExtrasToken } from './dynamic-menu-extras';
import { DYNAMIC_MENU_ROUTES_TOKEN } from './dynamic-menu-routes';

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

  constructor(
    private injector: Injector,
    private router: Router,
    private dynamicMenuExtrasToken: DynamicMenuExtrasToken,
  ) {}

  private getDynamicMenuRoutes() {
    return this.injector.get(DYNAMIC_MENU_ROUTES_TOKEN);
  }
}
