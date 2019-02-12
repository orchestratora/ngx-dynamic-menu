import { InjectionToken, Provider } from '@angular/core';

/**
 * Extra configuration for {@link DynamicMenuModule}
 */
export interface DynamicMenuExtras {
  /**
   * Instructs to listen for a router configuration changes
   * and then recompute dynamic menu.
   *
   * By default `false` to optimise performance.
   *
   * Enable only if you are not passing resolved lazy routes.
   */
  listenForConfigChanges?: boolean;
}

/**
 * DI token that hold extra configuration
 * @internal
 */
export class DynamicMenuExtrasToken implements DynamicMenuExtras {
  constructor(public listenForConfigChanges = false) {}
}

/**
 * Helper function to provide {@link DYNAMIC_MENU_EXTRAS_TOKEN}
 * @internal
 */
export function provideDynamicMenuExtras(
  extras: DynamicMenuExtras = {},
): Provider {
  return {
    provide: DynamicMenuExtrasToken,
    useValue: new DynamicMenuExtrasToken(extras.listenForConfigChanges),
  };
}
