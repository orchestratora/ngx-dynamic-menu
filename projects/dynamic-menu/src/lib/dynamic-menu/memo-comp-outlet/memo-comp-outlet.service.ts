import {
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleRef,
  OnDestroy,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemoCompOutletService implements OnDestroy {
  private memo = new Map<NgModuleFactory<any>, NgModuleRef<any>>();

  constructor() {}

  ngOnDestroy(): void {
    this.reset();
  }

  create(
    moduleFactory: NgModuleFactory<any>,
    parentInjector: Injector,
  ): NgModuleRef<any> {
    if (this.memo.has(moduleFactory)) {
      return this.memo.get(moduleFactory) as NgModuleRef<any>;
    }

    const moduleRef = moduleFactory.create(parentInjector);
    this.memo.set(moduleFactory, moduleRef);

    return moduleRef;
  }

  reset() {
    this.memo.clear();
  }
}
