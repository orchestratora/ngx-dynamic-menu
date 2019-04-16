/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MemoCompOutletService } from './memo-comp-outlet.service';

describe('Service: MemoCompOutlet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemoCompOutletService],
    });
  });

  it('should ...', inject(
    [MemoCompOutletService],
    (service: MemoCompOutletService) => {
      expect(service).toBeTruthy();
    },
  ));
});
