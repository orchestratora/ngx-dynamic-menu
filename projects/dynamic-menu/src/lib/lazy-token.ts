import {
  InjectFlags,
  InjectionToken,
  Injector,
  Provider,
  Type
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type DiToken<T> = InjectionToken<T> | Type<T>;

export interface LazyToken<T> {
  get(): Observable<T>;
}

export class LazyTokenFactory<T> {
  public tokenProvider = new InjectionToken<LazyToken<T>>(
    `LazyToken for ${this.token}`
  );

  public lazyTokenType: Type<LazyToken<T>> = class LazyTokenImpl<D> {
    private value = this.injector.get(this.t);
    private token$ = new BehaviorSubject<D>(this.value);

    constructor(
      private t: DiToken<D>,
      private tProvider: InjectionToken<LazyTokenImpl<D>>,
      private injector: Injector
    ) {
      const parentLazyToken = this.injector.get(
        this.tProvider,
        null as any,
        InjectFlags.SkipSelf
      );

      if (parentLazyToken) {
        parentLazyToken.update(this.value);
      }
    }

    get() {
      return this.token$.asObservable();
    }

    update(value: D) {
      this.token$.next(value);
    }
  };

  constructor(public token: DiToken<T>) {}

  provide(provider: Provider): Provider[] {
    return [provider, this.provideLazyToken()];
  }

  provideValue(value: T extends Array<infer V> ? V : T): Provider[] {
    const { token } = this;
    return [
      { provide: token, useValue: value, multi: true },
      this.provideLazyToken()
    ];
  }

  provideLazyToken(): Provider {
    const { tokenProvider } = this;

    return {
      provide: tokenProvider,
      useFactory: this.factory.bind(this),
      deps: [Injector]
    };
  }

  getServiceType() {
    return this.tokenProvider;
  }

  toString() {
    return `Lazy Token for ${this.token}`;
  }

  private factory(injector: Injector) {
    const { tokenProvider, lazyTokenType, token } = this;
    return new lazyTokenType(token, tokenProvider, injector);
  }
}

export function createLazyToken<T>(token: DiToken<T>) {
  return new LazyTokenFactory(token);
}
