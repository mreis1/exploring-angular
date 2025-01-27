import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaleListComponent } from './male-list.component';

describe('MaleListComponent', () => {
  let component: MaleListComponent;
  let fixture: ComponentFixture<MaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
