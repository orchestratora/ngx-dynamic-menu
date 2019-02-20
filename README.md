# NgxDynamicMenu

[![Build Status](https://travis-ci.org/orchestratora/ngx-dynamic-menu.svg?branch=master)](https://travis-ci.org/orchestratora/ngx-dynamic-menu)
[![Coverage](https://img.shields.io/codecov/c/github/orchestratora/ngx-dynamic-menu.svg?maxAge=2592000)](https://codecov.io/gh/orchestratora/ngx-dynamic-menu)
[![Npm](https://img.shields.io/npm/v/@orchestrator/ngx-dynamic-menu.svg)](https://www.npmjs.com/package/@orchestrator/ngx-dynamic-menu)
[![Npm Downloads](https://img.shields.io/npm/dt/@orchestrator/ngx-dynamic-menu.svg)](https://www.npmjs.com/package/@orchestrator/ngx-dynamic-menu)
![Size](https://badgen.net/bundlephobia/minzip/@orchestrator/ngx-dynamic-menu)
![Licence](https://img.shields.io/github/license/orchestratora/ngx-dynamic-menu.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Generate Angular application menu from your routing configuration!

```
$ npm install @orchestrator/ngx-dynamic-menu
```

## Table of Contents

- [Why](#why)
- [Usage](#usage)
  - [Customization](#customization)
- [Documentation](https://github.com/orchestratora/ngx-dynamic-menu/wiki)

## Why?

Stop duplicating navigation links! You already have them in your router configuration - just reuse it!

## Usage

Import `DynamicMenuModule` to your root module:

```ts
import { DynamicMenuModule } from '@orchestrator/ngx-dynamic-menu';

@NgModule({
  imports: [DynamicMenuModule.forRouter()],
})
export class AppModule {}
```

Then just render `<ndm-dynamic-menu>` or `<ndm-default-dynamic-menu>`
component where you want your menu to be:

```html
<nav>
  <ndm-default-dynamic-menu></ndm-default-dynamic-menu>
</nav>

<main>
  <router-outlet></router-outlet>
</main>
```

And your menu will magically appear in that location!

### Customization

You can render default menu via `<ndm-default-dynamic-menu>`
which will render menu within `ul > li` HTML tags.

But you have full control over your menu's template.
To provide your own template use `<ndm-dynamic-menu>` component:

```html
<ndm-dynamic-menu>
  <!-- Required -->
  <li *ndmDynamicMenuItem="let route; let item = item">
    <a [routerLink]="route.fullUrl">{{ item.label }}</a>
    <!-- <ndm-dynamic-menu-items> will render sub-groups if exist -->
    <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
  </li>

  <!-- Optional, by default renders list of items without wrapping tags -->
  <ul *ndmDynamicMenuWrapper>
    <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
  </ul>

  <!-- Optional, by default dynamicMenuItem template is used -->
  <li
    *ndmDynamicMenuToggle="
      let item;
      let route = route;
      let ctx = context
    "
  >
    <a [routerLink]="route.fullUrl">{{ item.label }}</a>
    <i class="down" (click)="ctx.opened = !ctx.opened"></i>
    <div class="group" *ngIf="ctx.opened">
      <ndm-dynamic-menu-items></ndm-dynamic-menu-items>
    </div>
  </li>
</ndm-dynamic-menu>
```

As you can see you have full control over your menu's template and functionality.

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
