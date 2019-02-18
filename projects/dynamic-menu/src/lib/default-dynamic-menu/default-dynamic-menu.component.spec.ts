/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DefaultDynamicMenuComponent } from './default-dynamic-menu.component';

describe('DefaultDynamicMenuComponent', () => {
  let component: DefaultDynamicMenuComponent;
  let fixture: ComponentFixture<DefaultDynamicMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultDynamicMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultDynamicMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
