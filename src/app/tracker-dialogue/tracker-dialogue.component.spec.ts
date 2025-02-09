import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackerDialogueComponent } from './tracker-dialogue.component';

describe('TrackerDialogueComponent', () => {
  let component: TrackerDialogueComponent;
  let fixture: ComponentFixture<TrackerDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackerDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackerDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
