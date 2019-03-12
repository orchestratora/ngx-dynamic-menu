import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { DynamicMenuService } from 'projects/dynamic-menu/src/public_api';

describe('Component: App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [{ provide: DynamicMenuService, useValue: {} }],
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
