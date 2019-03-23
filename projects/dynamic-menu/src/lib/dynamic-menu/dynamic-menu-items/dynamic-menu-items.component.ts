import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { DynamicMenuService } from '../../dynamic-menu.service';
import { DynamicMenuTemplateContext } from '../context-template';

export interface NgView<T, C = T> {
  component: T;
  context: C;
  parent?: NgView<any>;
}

@Component({
  selector: 'ndm-dynamic-menu-items',
  templateUrl: './dynamic-menu-items.component.html',
  styleUrls: ['./dynamic-menu-items.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicMenuItemsComponent implements OnInit {
  ctx!: DynamicMenuTemplateContext;

  navigationEnd$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd)
  );

  shouldRender$ = this.navigationEnd$.pipe(
    startWith(null),
    map(() => this.shouldRender())
  );

  constructor(
    private vcr: ViewContainerRef,
    private dynamicMenuService: DynamicMenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const ctx = this.getTplContext((this.vcr as any)._view);

    if (!ctx) {
      throw Error(`DynamicMenuItemsComponent: Used outside of context!`);
    }

    this.ctx = ctx;
  }

  private getTplContext(view: NgView<any> | undefined) {
    while (view) {
      if (view.context instanceof DynamicMenuTemplateContext) {
        return view.context;
      }

      view = view.parent;
    }
  }

  private shouldRender() {
    const { parentConfig } = this.ctx;

    if (parentConfig) {
      const {
        renderAsToggle,
        showChildrenIfActivated,
        showChildrenIfChildActivated
      } = parentConfig.data.menu;

      if (renderAsToggle) {
        return true;
      }

      if (showChildrenIfActivated) {
        return this.dynamicMenuService.isActive(parentConfig.fullUrl);
      } else if (showChildrenIfChildActivated) {
        return (
          !this.dynamicMenuService.isActive(parentConfig.fullUrl, true) &&
          this.dynamicMenuService.isActive(parentConfig.fullUrl)
        );
      }
    }

    return true;
  }
}
