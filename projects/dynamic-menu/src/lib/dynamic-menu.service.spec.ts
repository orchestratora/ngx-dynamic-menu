import { TestBed, async, inject } from '@angular/core/testing';
import { DynamicMenuService } from './dynamic-menu.service';

describe('Service: DynamicMenu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicMenuService],
    });
  });

  it('should ...', inject(
    [DynamicMenuService],
    (service: DynamicMenuService) => {
      expect(service).toBeTruthy();
    },
  ));
});
