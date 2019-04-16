import {
  ComponentFactoryResolver,
  Directive,
  Injector,
  Input,
  NgModuleFactory,
  NgModuleRef,
  OnChanges,
  SimpleChanges,
  SkipSelf,
  Type,
  ViewContainerRef,
} from '@angular/core';

import { MemoCompOutletService } from './memo-comp-outlet.service';

/**
 * @internal
 */
@Directive({
  selector: '[ndmMemoCompOutlet]',
})
export class MemoCompOutletDirective implements OnChanges {
  @Input() ndmMemoCompOutlet!: Type<any>;

  @Input() ndmMemoCompOutletInjector!: Injector;

  @Input() ndmMemoCompOutletContent!: any[][];

  @Input() ndmMemoCompOutletNgModuleFactory!: NgModuleFactory<any>;

  private moduleRef: NgModuleRef<any> | undefined;

  private get elInjector() {
    return this.ndmMemoCompOutletInjector || this.parentInjector;
  }

  private get componentFactoryResolver() {
    return this.moduleRef
      ? this.moduleRef.componentFactoryResolver
      : this.elInjector.get(ComponentFactoryResolver);
  }

  constructor(
    private vcr: ViewContainerRef,
    @SkipSelf() private parentInjector: Injector,
    private memoCompOutletService: MemoCompOutletService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.vcr.clear();

    if (this.ndmMemoCompOutlet) {
      if (changes.ndmMemoCompOutletNgModuleFactory) {
        this.updateModuleRef();
      }

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        this.ndmMemoCompOutlet,
      );

      this.vcr.createComponent(
        componentFactory,
        this.vcr.length,
        this.elInjector,
        this.ndmMemoCompOutletContent,
        this.moduleRef,
      );
    }
  }

  private updateModuleRef() {
    if (this.ndmMemoCompOutletNgModuleFactory) {
      this.moduleRef = this.memoCompOutletService.create(
        this.ndmMemoCompOutletNgModuleFactory,
        this.elInjector,
      );
    } else {
      this.moduleRef = undefined;
    }
  }
}
