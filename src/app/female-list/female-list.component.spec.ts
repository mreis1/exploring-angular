import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FemaleListComponent } from './female-list.component';

describe('FemaleListComponent', () => {
  let component: FemaleListComponent;
  let fixture: ComponentFixture<FemaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FemaleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FemaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
