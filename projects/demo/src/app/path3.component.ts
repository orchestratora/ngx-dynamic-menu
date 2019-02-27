import { Component } from '@angular/core';

@Component({
  selector: 'app-path3',
  template: `
    <p><a [routerLink]="['path3', 'myid', 'path6']">Go</a></p>
  `,
})
export class Path3Component {
  constructor() {}
}
