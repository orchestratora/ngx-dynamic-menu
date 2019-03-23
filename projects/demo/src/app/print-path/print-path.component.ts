import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-print-path',
  templateUrl: './print-path.component.html',
  styleUrls: ['./print-path.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintPathComponent {
  path$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    startWith(null),
    map(() => this.router.url)
  );

  path: string = this.router.url;

  constructor(private router: Router) {}
}
