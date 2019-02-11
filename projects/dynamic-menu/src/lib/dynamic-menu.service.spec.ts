import { TestBed } from '@angular/core/testing';

import { DynamicMenuService } from './dynamic-menu.service';

describe('DynamicMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicMenuService = TestBed.get(DynamicMenuService);
    expect(service).toBeTruthy();
  });
});
