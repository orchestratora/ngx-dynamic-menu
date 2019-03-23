import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RoutesWithMenu } from "projects/dynamic-menu/src/lib/types";

import { Feature1Component } from "./feature1.component";

const routes: RoutesWithMenu = [
  {
    path: "",
    component: Feature1Component
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [Feature1Component]
})
export class Feature1Module {}
