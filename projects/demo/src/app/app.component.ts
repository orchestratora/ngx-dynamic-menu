import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DynamicMenuService } from 'projects/dynamic-menu/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(private dynamicMenuService: DynamicMenuService) {}

  ngOnInit(): void {
    this.dynamicMenuService.addMenuAfter(['path3', ':id', 'path6'], {
      path: 'custom-path',
      data: { menu: { label: 'Custom Section' } }
    });
    this.dynamicMenuService.addMenuToStart(['path3', ':id', 'path6'], {
      path: 'custom-path2',
      data: { menu: { label: 'Custom Section - Start' } }
    });
    this.dynamicMenuService.addMenuToEnd(['path3', ':id', 'path6'], {
      path: 'custom-path3',
      data: { menu: { label: 'Custom Section - End' } }
    });
    this.dynamicMenuService.addMenuToStart([''], {
      path: 'custom-path-start',
      data: { menu: { label: 'Custom Section - Start' } }
    });
    this.dynamicMenuService.addMenuToEnd([''], {
      path: 'custom-path-end',
      data: { menu: { label: 'Custom Section - End' } }
    });
  }
}
