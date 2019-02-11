import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DynamicMenuExtrasToken } from './dynamic-menu-extras';
import { DynamicMenuService } from './dynamic-menu.service';

describe('Service: DynamicMenu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        DynamicMenuService,
        {
          provide: DynamicMenuExtrasToken,
          useValue: new DynamicMenuExtrasToken(),
        },
      ],
    });
  });

  it('should ...', inject(
    [DynamicMenuService],
    (service: DynamicMenuService) => {
      expect(service).toBeTruthy();
    },
  ));
});
