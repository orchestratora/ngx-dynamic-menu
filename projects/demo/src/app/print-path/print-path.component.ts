import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-print-path',
  templateUrl: './print-path.component.html',
  styleUrls: ['./print-path.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintPathComponent {
  path$ = this.route.url.pipe(map(() => this.router.url));

  constructor(private route: ActivatedRoute, private router: Router) {}
}
