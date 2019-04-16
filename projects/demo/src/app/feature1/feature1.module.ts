import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithMenu } from 'projects/dynamic-menu/src/lib/types';
import { DynamicMenuModule } from 'projects/dynamic-menu/src/public_api';

import { Feature1Component } from './feature1.component';

const routes: RoutesWithMenu = [
  {
    path: '',
    component: Feature1Component,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), DynamicMenuModule],
  declarations: [Feature1Component],
  providers: [
    ...DynamicMenuModule.provideSubMenu('Feature1Component', Feature1Component),
  ],
})
export class Feature1Module {}
