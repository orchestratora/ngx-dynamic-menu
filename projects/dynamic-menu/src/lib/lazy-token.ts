import {
  InjectFlags,
  InjectionToken,
  Injector,
  NgModuleRef,
  Provider,
  Type,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

export type DiToken<T> = InjectionToken<T> | Type<T>;

export interface LazyTokenInfo<T> {
  moduleRef: NgModuleRef<any>;
  value: T;
}

export interface LazyToken<T> {
  get(): Observable<T[]>;
  getInfo(): Observable<LazyTokenInfo<T>[]>;
}

/**
 * @internal
 */
export const LAZY_TOKENS = new InjectionToken<LazyToken<any>[]>('LAZY_TOKENS');

export class LazyTokenFactory<T> {
  public tokenProvider = new InjectionToken<LazyToken<T>>(
    `LazyToken for ${this.token}`,
  );

  public lazyTokenType: Type<LazyToken<T>> = class LazyTokenImpl<D> {
    private value = this.injector.get(this.t);
    private tokenInfo$ = new BehaviorSubject<LazyTokenInfo<D>[]>([
      { moduleRef: this.moduleRef, value: this.value },
    ]);
    private token$ = this.tokenInfo$.pipe(
      map(tokenInfo => tokenInfo.map(info => info.value)),
      publishReplay(),
      refCount(),
    );

    constructor(
      private t: DiToken<D>,
      private tProvider: InjectionToken<LazyTokenImpl<D>>,
      private moduleRef: NgModuleRef<any>,
      private injector: Injector,
    ) {
      const parentLazyToken = this.injector.get(
        this.tProvider,
        null as any,
        InjectFlags.SkipSelf,
      );

      if (parentLazyToken) {
        parentLazyToken.update(this.value, this.moduleRef);
      }
    }

    getInfo() {
      return this.tokenInfo$.asObservable();
    }

    get() {
      return this.token$;
    }

    update(value: D, moduleRef: NgModuleRef<any>) {
      const moduleCtor = moduleRef.instance.constructor;

      const moduleExists = this.tokenInfo$
        .getValue()
        .some(info => info.moduleRef.instance.constructor === moduleCtor);

      if (moduleExists) {
        return;
      }

      this.tokenInfo$.next([
        ...this.tokenInfo$.getValue(),
        { moduleRef, value },
      ]);
    }
  };

  constructor(public token: DiToken<T>) {}

  provide(provider: Provider): Provider[] {
    return [provider, ...this.provideLazyToken()];
  }

  provideValue(value: T extends Array<infer V> ? V : T): Provider[] {
    const { token } = this;
    return [
      { provide: token, useValue: value, multi: true },
      ...this.provideLazyToken(),
    ];
  }

  provideLazyToken(): Provider[] {
    const { tokenProvider } = this;

    return [
      {
        provide: tokenProvider,
        useFactory: this.factory.bind(this),
        deps: [Injector, NgModuleRef],
      },
      {
        provide: LAZY_TOKENS,
        useExisting: tokenProvider,
        multi: true,
      },
    ];
  }

  getServiceType() {
    return this.tokenProvider;
  }

  toString() {
    return `Lazy Token for ${this.token}`;
  }

  private factory(injector: Injector, ngModule: NgModuleRef<any>) {
    const { tokenProvider, lazyTokenType, token } = this;
    return new lazyTokenType(token, tokenProvider, injector, ngModule);
  }
}

export function createLazyToken<T>(token: DiToken<T>) {
  return new LazyTokenFactory(token);
}
