import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicMenuItemsComponent implements OnInit {
  ctx: DynamicMenuTemplateContext | undefined;

  constructor(private vcr: ViewContainerRef) {}

  ngOnInit(): void {
    this.ctx = this.getTplContext((this.vcr as any)._view);

    if (!this.ctx) {
      throw Error(`DynamicMenuItemsComponent: Used outside of context!`);
    }
  }

  private getTplContext(view: NgView<any> | undefined) {
    while (view) {
      if (view.context instanceof DynamicMenuTemplateContext) {
        return view.context;
      }

      view = view.parent;
    }
  }
}
