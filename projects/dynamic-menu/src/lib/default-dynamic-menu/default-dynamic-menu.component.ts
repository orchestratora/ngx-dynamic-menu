import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ndm-default-dynamic-menu',
  templateUrl: './default-dynamic-menu.component.html',
  styleUrls: ['./default-dynamic-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultDynamicMenuComponent {}
