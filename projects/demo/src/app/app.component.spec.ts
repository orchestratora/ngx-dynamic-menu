import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('Component: App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  it('should render <ndm-default-dynamic-menu>', () => {
    const fixture = TestBed.createComponent(AppComponent);

    const menuElem = fixture.debugElement.query(
      By.css('ndm-default-dynamic-menu'),
    );

    expect(menuElem).toBeTruthy();
  });

  it('should render <router-outlet> after <ndm-default-dynamic-menu>', () => {
    const fixture = TestBed.createComponent(AppComponent);

    const outletElem = fixture.debugElement.query(
      By.css('ndm-default-dynamic-menu + router-outlet'),
    );

    expect(outletElem).toBeTruthy();
  });
});
