import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithMenu } from 'projects/dynamic-menu/src/lib/types';
import { DynamicMenuModule } from 'projects/dynamic-menu/src/public_api';

import { PrintPathComponent } from './print-path/print-path.component';

const routes: RoutesWithMenu = [
  {
    path: '',
    component: PrintPathComponent,
    data: { menu: { label: 'Home' } },
  },
  {
    path: 'path2',
    component: PrintPathComponent,
    data: { menu: { label: 'Section 2', renderAsToggle: true } },
    children: [
      {
        path: 'path4',
        component: PrintPathComponent,
        data: { menu: { label: 'Section 4' } },
      },
      {
        path: 'path5',
        component: PrintPathComponent,
        data: { menu: { label: 'Section 5', renderAsToggle: true } },
        children: [
          {
            path: 'path8',
            component: PrintPathComponent,
            data: { menu: { label: 'Section 8' } },
          },
        ],
      },
    ],
  },
  {
    path: 'path3',
    component: PrintPathComponent,
    data: {
      menu: {
        label: 'Section 3',
        showChildrenIfActivated: true,
        subMenuComponent: 'SubMenuForSection3',
      },
    },
    children: [
      {
        path: 'path6',
        component: PrintPathComponent,
        data: { menu: { label: 'Section 6' } },
      },
      {
        path: 'path7',
        component: PrintPathComponent,
        data: { menu: { label: 'Section 7' } },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    DynamicMenuModule.provideSubMenu('SubMenuForSection3', PrintPathComponent),
  ],
})
export class AppRoutingModule {}
