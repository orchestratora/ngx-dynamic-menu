import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DynamicMenuService } from '../dynamic-menu.service';
import { DynamicMenuRouteConfig } from '../types';
import { DynamicMenuItemContext } from './context-item';
import { DynamicMenuToggleContext } from './context-toggle';
import { DynamicMenuWrapperContext } from './context-wrapper';
import { DynamicMenuItemDirective } from './dynamic-menu-item/dynamic-menu-item.directive';
import { DynamicMenuToggleDirective } from './dynamic-menu-toggle/dynamic-menu-toggle.directive';
import { DynamicMenuWrapperDirective } from './dynamic-menu-wrapper/dynamic-menu-wrapper.directive';

@Component({
  selector: 'ndm-dynamic-menu',
  templateUrl: './dynamic-menu.component.html',
  styleUrls: ['./dynamic-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicMenuComponent implements OnInit, OnDestroy {
  @ContentChild(DynamicMenuWrapperDirective)
  wrapperDir: DynamicMenuWrapperDirective | undefined;

  @ContentChild(DynamicMenuItemDirective)
  itemDir: DynamicMenuItemDirective | undefined;

  @ContentChild(DynamicMenuToggleDirective)
  toggleDir: DynamicMenuToggleDirective | undefined;

  menu$: Observable<DynamicMenuRouteConfig[]> = EMPTY;

  private ctxCache = new Map<any, any>();
  private destroyed$ = new Subject<void>();

  constructor(private dynamicMenuService: DynamicMenuService) {}

  ngOnInit(): void {
    this.menu$ = this.dynamicMenuService.getMenu();

    this.menu$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.ctxCache.clear());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.ctxCache.clear();
  }

  getWrapperCtx(configs: DynamicMenuRouteConfig[], tpl: TemplateRef<any>) {
    return this.getCtx(
      configs,
      () => new DynamicMenuWrapperContext(configs, tpl),
    );
  }

  getItemCtx(config: DynamicMenuRouteConfig, tpl: TemplateRef<any>) {
    return this.getCtx(config, () => new DynamicMenuItemContext(config, tpl));
  }

  getToggleCtx(config: DynamicMenuRouteConfig, tpl: TemplateRef<any>) {
    return this.getCtx(config, () => {
      const opened = this.dynamicMenuService.isActive(config.fullUrl);
      return new DynamicMenuToggleContext(config, tpl, opened);
    });
  }

  private getCtx<T>(key: any, factory: () => T): T {
    if (this.ctxCache.has(key)) {
      return this.ctxCache.get(key);
    }

    const ctx = factory();
    this.ctxCache.set(key, ctx);

    return ctx;
  }
}
